import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { createHubSource } from "../client";
import { filterResources, typesWithResources } from "../filters";
import { createFixtureSource, FIXTURE_MARK } from "../fixtures";
import { parseResourceDetail, parseResourceSummary } from "../parse";
import { TYPE_SEGMENT, hasStaticPage, pageIsIndexable, typeFromSegment } from "../routes";
import { resolveSourceKind } from "../source";
import { RESOURCE_TYPES, type ResourceSummary } from "../types";
import ResourceDetailView from "../../../components/marketplace/resources/ResourceDetailView";
import ResourceStateBlock from "../../../components/marketplace/resources/ResourceStateBlock";
import { marketplaceSitemapAllows } from "../../../../scripts/marketplace-sitemap-filter.mjs";

// The contract example (PUBLIC_PROJECTIONS_CONTRACT_V1 section 8), used verbatim.
const example = () => ({
  resourceKey: "studio.menu-restaurante", type: "studio_template", slug: "menu-restaurante", title: "Menú de restaurante", summary: "Plantilla de menú de una página.",
  publisher: { handle: "acme-labs", displayName: "Acme Labs", verified: true }, trust: "community-verified", availability: "available", listed: true, indexable: true,
  latest: { version: "1.0.0", releaseId: "11111111-1111-4111-8111-111111111111", publishedAt: "2026-11-08T12:00:00.000Z", sha256: "33b5023b1684269387cb7312ba6a4bb9f2b756daa5d473fef57d87294dce7e6a", size: 37 },
  license: "CC-BY-4.0", compatibility: { runly: { min: "1.0.0", max: null }, format: { name: "studio", version: 1 } }, categories: [], locale: "es", previews: [], updatedAt: "2026-11-08T12:00:00.000Z",
  futureField: "ignored",
});

const res = (status: number, body: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

describe("parseResourceSummary", () => {
  it("accepts the contract example and ignores unknown fields", () => {
    const r = parseResourceSummary(example())!;
    expect(r.resourceKey).toBe("studio.menu-restaurante");
    expect("futureField" in r).toBe(false);
  });

  it("rejects inconsistent identity, trust promotion and unsafe previews", () => {
    expect(parseResourceSummary({ ...example(), resourceKey: "automation.menu-restaurante" })).toBeNull();
    expect(parseResourceSummary({ ...example(), resourceKey: "custom.menu-restaurante" })).toBeNull();
    expect(parseResourceSummary({ ...example(), trust: "community-verified", publisher: { handle: "acme-labs", displayName: "Acme", verified: false } })).toBeNull();
    expect(parseResourceSummary({ ...example(), availability: "revoked", trust: "official" })).toBeNull();
    const preview = (patch: object) => parseResourceSummary({ ...example(), previews: [{ sha256: "a".repeat(64), url: `/api/v1/marketplace/previews/${"a".repeat(64)}`, contentType: "image/png", width: 10, height: 10, alt: "x", ...patch }] })!.previews;
    expect(preview({})).toHaveLength(1);
    expect(preview({ url: "https://evil.example/x.png" })).toHaveLength(0);
    expect(preview({ contentType: "image/svg+xml" })).toHaveLength(0);
  });

  it("only listed, available resources can be indexable", () => {
    expect(parseResourceSummary({ ...example(), listed: false })!.indexable).toBe(false);
    expect(parseResourceSummary({ ...example(), availability: "withdrawn" })!.indexable).toBe(false);
  });

  it("keeps markup as inert text", () => {
    const html = renderToStaticMarkup(createElement(ResourceDetailView, { resource: { ...parseResourceDetail({ ...example(), description: "", format: { name: "studio", version: 1 }, requirements: {}, versions: [] })!, title: '<img src=x onerror="x">', description: "<script>alert(1)</script>" } }));
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("fixtures", () => {
  it("are contract-valid, clearly marked and cover every state", async () => {
    const source = createFixtureSource();
    const list = await source.list();
    expect(list.status).toBe("ok");
    const items = list.status === "ok" ? list.items : [];
    expect(source.kind).toBe("fixtures");
    expect(items.every((r) => r.title.startsWith(FIXTURE_MARK))).toBe(true);
    expect(new Set(items.map((r) => r.type))).toEqual(new Set(RESOURCE_TYPES));
    expect(items.map((r) => r.availability)).toEqual(expect.arrayContaining(["available", "withdrawn", "revoked"]));
    const solution = await source.detail("solution", "restaurante-express");
    expect(solution.status === "ok" && solution.resource.solution?.components.length).toBeGreaterThan(0);
  });
});

describe("hub source (PUBLIC_PROJECTIONS_CONTRACT_V1)", () => {
  it("lists with pagination, drops invalid and unlisted entries", async () => {
    const seen: string[] = [];
    const source = createHubSource({
      hubUrl: "https://hub.example.test",
      fetchImpl: async (url) => {
        seen.push(url);
        return url.includes("cursor=c2")
          ? res(200, { schemaVersion: 1, feed: { sequence: 2, generatedAt: "2026-11-08T12:00:00.000Z" }, total: 3, nextCursor: null, items: [{ ...example(), resourceKey: "studio.otro-menu", slug: "otro-menu" }] })
          : res(200, { schemaVersion: 1, feed: { sequence: 2, generatedAt: "2026-11-08T12:00:00.000Z" }, total: 3, nextCursor: "c2", items: [example(), { ...example(), resourceKey: "studio.oculto", slug: "oculto", listed: false }, { nonsense: true }] });
      },
    });
    const list = await source.list();
    expect(list.status === "ok" && list.items.map((r) => r.slug)).toEqual(["menu-restaurante", "otro-menu"]);
    expect(seen[0]).toBe("https://hub.example.test/api/v1/marketplace/resources?limit=100");
  });

  it("reports unavailable, never invented data, when the endpoints do not exist yet", async () => {
    for (const fetchImpl of [async () => res(404, {}), async () => { throw new Error("down"); }, async () => res(200, { schemaVersion: 2 })]) {
      const list = await createHubSource({ fetchImpl }).list();
      expect(list.status).toBe("unavailable");
      expect(list.items).toEqual([]);
    }
  });

  it("maps 404/410 and rejects a payload for a different resource", async () => {
    const make = (status: number, body: unknown) => createHubSource({ fetchImpl: async () => res(status, body) });
    expect(await make(404, {}).detail("studio_template", "menu-restaurante")).toEqual({ status: "not_found" });
    expect(await make(410, { schemaVersion: 1, availability: "revoked", replacement: { resourceKey: "studio.nuevo", version: "2.0.0" } }).detail("studio_template", "menu-restaurante"))
      .toEqual({ status: "gone", availability: "revoked", replacement: { resourceKey: "studio.nuevo", version: "2.0.0" } });
    expect((await make(500, {}).detail("studio_template", "menu-restaurante")).status).toBe("unavailable");
    expect((await make(200, { schemaVersion: 1, resource: { ...example(), description: "", format: { name: "studio", version: 1 } } }).detail("studio_template", "otro-slug")).status).toBe("unavailable");
    expect((await make(200, {}).detail("studio_template", "../etc")).status).toBe("not_found");
  });
});

describe("filters and routes", () => {
  const items: ResourceSummary[] = ["a-uno", "b-dos"].map((slug, i) => parseResourceSummary({ ...example(), resourceKey: `${i ? "automation" : "studio"}.${slug}`, type: i ? "automation" : "studio_template", slug, title: i ? "Cobranza ágil" : "Menú", categories: i ? ["finanzas"] : [] })!);

  it("filters by text (accent-insensitive), type, trust and category; announces only types with resources", () => {
    expect(filterResources(items, { query: "agil" }).map((r) => r.slug)).toEqual(["b-dos"]);
    expect(filterResources(items, { type: "studio_template" })).toHaveLength(1);
    expect(filterResources(items, { category: "finanzas" })).toHaveLength(1);
    expect(filterResources(items, { trust: "official" })).toHaveLength(0);
    expect(typesWithResources(items)).toEqual(["studio_template", "automation"]);
    expect(typesWithResources([{ ...items[0], availability: "withdrawn" }])).toEqual([]);
  });

  it("maps type segments both ways and decides static pages / indexing", () => {
    for (const type of RESOURCE_TYPES) expect(typeFromSegment(TYPE_SEGMENT[type])).toBe(type);
    expect(typeFromSegment("publicadores")).toBeNull();
    const hidden = { ...items[0], listed: false, indexable: false };
    expect(hasStaticPage("hub", items[0])).toBe(true);
    expect(hasStaticPage("hub", hidden)).toBe(false);
    expect(hasStaticPage("fixtures", hidden)).toBe(true);
    expect(pageIsIndexable("fixtures", items[0])).toBe(false);
    expect(pageIsIndexable("hub", items[0])).toBe(true);
  });
});

describe("source and sitemap policy", () => {
  it("never lets a production build use fixtures by accident", () => {
    expect(resolveSourceKind({ DEV: true })).toBe("fixtures");
    expect(resolveSourceKind({ DEV: false })).toBe("hub");
    expect(() => resolveSourceKind({ MARKETPLACE_SOURCE: "fixtures", DEV: false })).toThrow(/ALLOW_FIXTURE_BUILD/);
    expect(resolveSourceKind({ MARKETPLACE_SOURCE: "fixtures", DEV: false, MARKETPLACE_ALLOW_FIXTURE_BUILD: "1" })).toBe("fixtures");
  });

  it("keeps Marketplace out of the sitemap unless opted in with real data", () => {
    const u = "https://runly.mx/marketplace/";
    expect(marketplaceSitemapAllows("https://runly.mx/modulos/", {})).toBe(true);
    expect(marketplaceSitemapAllows(u, {})).toBe(false);
    expect(marketplaceSitemapAllows(u, { MARKETPLACE_SITEMAP: "1" })).toBe(true);
    expect(marketplaceSitemapAllows(u, { MARKETPLACE_SITEMAP: "1", MARKETPLACE_SOURCE: "fixtures" })).toBe(false);
    expect(marketplaceSitemapAllows("https://runly.mx/marketplace/detalle/", { MARKETPLACE_SITEMAP: "1" })).toBe(false);
  });
});

describe("states", () => {
  it("renders every state with the right role, and no download action on a detail sheet", async () => {
    for (const kind of ["loading", "empty", "unavailable", "not_found", "withdrawn", "revoked", "fixture"] as const) {
      expect(renderToStaticMarkup(createElement(ResourceStateBlock, { kind }))).toContain(`data-state="${kind}"`);
    }
    expect(renderToStaticMarkup(createElement(ResourceStateBlock, { kind: "revoked" }))).toContain('role="alert"');
    const detail = await createFixtureSource().detail("automation", "aviso-de-lead");
    const html = renderToStaticMarkup(createElement(ResourceDetailView, { resource: detail.status === "ok" ? detail.resource : (null as never) }));
    expect(html).toContain("Usar en Runly");
    expect(html).not.toMatch(/download|descargar/i);
    const revoked = await createFixtureSource().detail("automation", "cierre-semanal");
    const revokedHtml = renderToStaticMarkup(createElement(ResourceDetailView, { resource: revoked.status === "ok" ? revoked.resource : (null as never) }));
    expect(revokedHtml).toContain('data-state="revoked"');
    expect(revokedHtml).not.toContain("usar-en-runly");
  });
});
