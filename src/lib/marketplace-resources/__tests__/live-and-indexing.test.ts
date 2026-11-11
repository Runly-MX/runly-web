import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { parseResourceDetail } from "../parse";
import { liveStateFrom, liveView } from "../live";
import { pageIsIndexable } from "../routes";
import type { Preview, ResourceDetail } from "../types";
import ResourceDetailView from "../../../components/marketplace/resources/ResourceDetailView";
import PreviewGallery from "../../../components/marketplace/resources/PreviewGallery";
import ResourceCard from "../../../components/marketplace/resources/ResourceCard.astro";

// Contract-shaped Hub payloads (PUBLIC_PROJECTIONS_CONTRACT_V1 section 4.2), parsed by the real parser.
const SHA = (c: string) => c.repeat(64);
const shot = (c: string, alt: string): Preview => ({ sha256: SHA(c), url: `/api/v1/marketplace/previews/${SHA(c)}`, contentType: "image/webp", width: 1920, height: 1280, alt });
function hubDetail({ version = "1.0.0", releaseId = "11111111-1111-4111-8111-111111111111", previews = [shot("a", "Portada")], versions = undefined as unknown[] | undefined, fonts = ["Inter"] } = {}): ResourceDetail {
  const raw = {
    resourceKey: "studio.menu-restaurante", type: "studio_template", slug: "menu-restaurante", title: "Menú de restaurante", summary: "Menú de una página.",
    publisher: { handle: "acme-labs", displayName: "Acme Labs", verified: true }, trust: "community-verified", availability: "available", listed: true, indexable: true,
    latest: { version, releaseId, publishedAt: "2026-11-10T12:00:00.000Z", sha256: SHA("c"), size: 37 }, license: "CC-BY-4.0",
    compatibility: { runly: { min: "1.0.0", max: null }, format: { name: "studio", version: 1 } }, categories: ["restaurantes"], locale: "es", previews, updatedAt: "2026-11-10T12:00:00.000Z",
    description: "Plantilla de menú.", requirements: { modules: [], fonts, permissions: [], services: [], builder: null }, provenance: { declaredBy: "publisher", note: null },
    format: { name: "studio", version: 1 }, riskSummary: null,
    versions: versions ?? [{ version, releaseId, status: "published", publishedAt: "2026-11-10T12:00:00.000Z", sha256: SHA("c"), size: 37, changelog: "", replacement: null }],
    install: { how: "in-runly", releaseId, resourcePath: "Marketplace › Plantillas de Studio" },
  };
  const parsed = parseResourceDetail(raw);
  if (!parsed) throw new Error("contract example must parse");
  return parsed;
}
const ok = (resource: ResourceDetail) => ({ status: "ok" as const, source: "hub" as const, feed: null, resource });

describe("static page: the Hub's CURRENT answer is the source of truth", () => {
  it("200 replaces the built copy entirely: 1.0.0 withdrawn, 1.1.0 available -> only 1.1.0 data", () => {
    const built = hubDetail({ previews: [shot("a", "Portada antigua")] });
    const current = hubDetail({
      version: "1.1.0", releaseId: "22222222-2222-4222-8222-222222222222", previews: [shot("b", "Portada nueva"), shot("d", "Detalle nuevo")], fonts: ["Inter", "Lato"],
      versions: [
        { version: "1.1.0", releaseId: "22222222-2222-4222-8222-222222222222", status: "published", publishedAt: "2026-11-11T12:00:00.000Z", sha256: SHA("e"), size: 40, changelog: "Nueva versión.", replacement: null },
        { version: "1.0.0", releaseId: "11111111-1111-4111-8111-111111111111", status: "withdrawn", publishedAt: "2026-11-10T12:00:00.000Z", sha256: SHA("c"), size: 37, changelog: "", replacement: null },
      ],
    });
    const view = liveView(built, liveStateFrom(ok(current), built));
    expect(view.showInstall).toBe(true);
    expect(view.resource.install!.releaseId).toBe("22222222-2222-4222-8222-222222222222");
    expect(view.resource.latest!.version).toBe("1.1.0");
    expect(view.resource.previews.map((p) => p.alt)).toEqual(["Portada nueva", "Detalle nuevo"]);
    expect(view.resource.requirements.fonts).toEqual(["Inter", "Lato"]);
    expect(view.resource.versions.map((v) => [v.version, v.status])).toEqual([["1.1.0", "published"], ["1.0.0", "withdrawn"]]);
    const html = renderToStaticMarkup(createElement(ResourceDetailView, { resource: view.resource }));
    expect(html).toContain("Descargar .runlystudio");
    expect(html).toContain("v1.1.0");
    expect(html).not.toContain("22222222-2222-4222-8222-222222222222");
    expect(html).not.toContain("11111111-1111-4111-8111-111111111111");
    expect(html).not.toContain("Portada antigua");
  });

  it("an answer about another resource is never trusted", () => {
    const built = hubDetail();
    const other = { ...hubDetail(), resourceKey: "studio.otro", slug: "otro" };
    expect(liveStateFrom(ok(other), built)).toEqual({ phase: "error" });
  });

  it("while checking, on error, 410 and 404: no guide, no release id and no previews; history stays", () => {
    const built = hubDetail({ previews: [shot("a", "Portada")] });
    const states = [
      { phase: "checking" as const },
      liveStateFrom({ status: "unavailable", reason: "timeout" }, built),
      liveStateFrom({ status: "unavailable", reason: "network" }, built),
      liveStateFrom({ status: "gone", availability: "revoked", replacement: null }, built),
      liveStateFrom({ status: "gone", availability: "withdrawn", replacement: { resourceKey: "studio.otro", version: "2.0.0" } }, built),
      liveStateFrom({ status: "not_found" }, built),
    ];
    expect(states.map((s) => s.phase)).toEqual(["checking", "error", "error", "gone", "gone", "missing"]);
    for (const state of states) {
      const view = liveView(built, state);
      expect(view.showInstall).toBe(false);
      expect(view.resource.previews).toEqual([]);
      expect(view.resource.title).toBe(built.title);
      expect(view.resource.license).toBe(built.license);
    }
    expect(liveView(built, states[3]).notice).toBe("revoked");
    expect(liveView(built, states[3]).resource.trust).toBe("revoked");
    expect(liveView(built, states[3]).versionStatuses).toBe(false);
    expect(liveView(built, states[5]).notice).toBe("missing");
  });

  it("a 200 for a resource the Hub no longer offers as available is not 'available'", () => {
    const built = hubDetail();
    expect(liveStateFrom(ok({ ...hubDetail(), availability: "withdrawn" }), built).phase).toBe("gone");
  });

  it("the built HTML of a static Hub page shows neither guide nor previews before the browser verifies", () => {
    const r = hubDetail();
    const pending = renderToStaticMarkup(createElement(ResourceDetailView, { resource: r, checkLive: true }));
    expect(pending).not.toContain("data-resource-actions");
    expect(pending).not.toContain(r.install!.releaseId);
    expect(pending).not.toContain("data-gallery");
    expect(pending).toContain('data-live-notice="checking"');
    expect(pending).toContain(r.title);
    const fresh = renderToStaticMarkup(createElement(ResourceDetailView, { resource: r }));
    expect(fresh).toContain("data-resource-actions");
    expect(fresh).toContain("data-gallery");
  });
});

describe("preview gallery", () => {
  it("one preview: main image with its alt text, no thumbnails", () => {
    const html = renderToStaticMarkup(createElement(PreviewGallery, { previews: [shot("a", "Portada del menú")], hubUrl: "https://devs.runly.mx" }));
    expect(html).toContain('data-count="1"');
    expect(html).toContain('alt="Portada del menú"');
    expect(html).toContain(`src="https://devs.runly.mx/api/v1/marketplace/previews/${SHA("a")}"`);
    expect(html).not.toContain("Elegir vista previa");
    expect(html).toContain("<dialog");
  });

  it("several previews: selectable thumbnails with accessible names, at most six", () => {
    const many = ["a", "b", "c", "d", "e", "f", "1"].map((c, i) => shot(c, `Captura ${i + 1}`));
    const html = renderToStaticMarkup(createElement(PreviewGallery, { previews: many, hubUrl: "https://devs.runly.mx" }));
    expect(html).toContain('data-count="6"');
    expect(html.match(/aria-label="Ver vista previa \d+:/g)?.length).toBe(6);
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain("Captura 7");
    expect(html).toContain("1 de 6");
  });

  it("images the parser rejects never reach the gallery", () => {
    const rejected = [
      { ...shot("a", "SVG"), contentType: "image/svg+xml" },
      { ...shot("b", "Externa"), url: "https://evil.example/x.png" },
      { ...shot("c", "Sin alt"), alt: "" },
      { ...shot("d", "Enorme"), width: 5000 },
      { ...shot("e", "URL de otro hash"), url: `/api/v1/marketplace/previews/${SHA("f")}` },
    ];
    const parsed = parseResourceDetail({ ...JSON.parse(JSON.stringify(hubDetail())), previews: rejected, latest: hubDetail().latest });
    expect(parsed!.previews).toEqual([]);
    expect(renderToStaticMarkup(createElement(PreviewGallery, { previews: parsed!.previews }))).toBe("");
  });
});

describe("catalog card", () => {
  it("shows the first authentic preview, otherwise a type-icon cover (never an invented image); links and labels unchanged", async () => {
    const container = await AstroContainer.create();
    const withPreview = await container.renderToString(ResourceCard, { props: { resource: hubDetail({ previews: [shot("a", "Portada del menú"), shot("b", "Otra")] }), source: "hub" } });
    expect(withPreview).toContain("data-mk-preview");
    expect(withPreview).toContain('alt="Portada del menú"');
    expect(withPreview).toContain(`/api/v1/marketplace/previews/${SHA("a")}`);
    expect(withPreview).not.toContain(`/api/v1/marketplace/previews/${SHA("b")}`);
    expect(withPreview).not.toContain("data-mk-icon");
    expect(withPreview).toContain('href="/marketplace/plantillas-studio/menu-restaurante/"');
    expect(withPreview).toContain('data-search=');
    const without = await container.renderToString(ResourceCard, { props: { resource: hubDetail({ previews: [] }), source: "hub" } });
    expect(without).toContain("data-mk-preview-fallback");
    expect(without).not.toContain("<img");
  });
});

describe("Marketplace indexing follows the sitemap opt-in", () => {
  it("is noindex without explicit authorization, even with real Hub data", () => {
    const r = hubDetail();
    expect(pageIsIndexable("hub", false)).toBe(false);
    expect(pageIsIndexable("hub", false, r)).toBe(false);
    expect(pageIsIndexable("hub", true, r)).toBe(true);
    expect(pageIsIndexable("fixtures", true, r)).toBe(false);
    expect(pageIsIndexable("hub", true, { ...r, listed: false })).toBe(false);
    expect(pageIsIndexable("hub", true, { ...r, indexable: false })).toBe(false);
    expect(pageIsIndexable("hub", true, { ...r, availability: "withdrawn" })).toBe(false);
  });
});
