import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { createFixtureSource } from "../fixtures";
import { liveStateFrom, liveView } from "../live";
import { pageIsIndexable } from "../routes";
import type { ResourceDetail } from "../types";
import ResourceDetailView from "../../../components/marketplace/resources/ResourceDetailView";

async function availableDetail(): Promise<ResourceDetail> {
  const source = createFixtureSource();
  const list = await source.list();
  const item = list.items.find((r) => r.availability === "available" && r.type === "automation")!;
  const detail = await source.detail(item.type, item.slug);
  if (detail.status !== "ok") throw new Error("fixture detail");
  return detail.resource;
}

describe("current availability of a statically built resource page", () => {
  it("never shows the install guide or release id while checking or after an error", async () => {
    const r = await availableDetail();
    for (const phase of ["checking", "error"] as const) {
      const view = liveView(r, { phase });
      expect(view.showInstall).toBe(false);
      expect(view.notice).toBe(phase);
      expect(view.versionStatuses).toBe(true);
    }
    // A timeout or network failure of the client is an error, never "available".
    expect(liveStateFrom({ status: "unavailable", reason: "timeout" })).toEqual({ phase: "error" });
    expect(liveStateFrom({ status: "unavailable", reason: "network" })).toEqual({ phase: "error" });
  });

  it("enables the guide only after a 200 with an available resource", async () => {
    const r = await availableDetail();
    const state = liveStateFrom({ status: "ok", source: "hub", feed: null, resource: r });
    expect(state).toEqual({ phase: "available" });
    expect(liveView(r, state)).toMatchObject({ showInstall: true, notice: null, versionStatuses: true });
  });

  it("410: withdrawn or revoked, guide hidden, no per-version status invented", async () => {
    const r = await availableDetail();
    const revoked = liveView(r, liveStateFrom({ status: "gone", availability: "revoked", replacement: { resourceKey: "automation.otro", version: "2.0.0" } }));
    expect(revoked).toMatchObject({ showInstall: false, notice: "revoked", versionStatuses: false, replacement: { resourceKey: "automation.otro", version: "2.0.0" } });
    expect(revoked.resource.trust).toBe("revoked");
    const withdrawn = liveView(r, liveStateFrom({ status: "gone", availability: "withdrawn", replacement: null }));
    expect(withdrawn).toMatchObject({ showInstall: false, notice: "withdrawn", versionStatuses: false });
    expect(withdrawn.resource.title).toBe(r.title);
  });

  it("404: no longer available, no reason invented", async () => {
    const r = await availableDetail();
    expect(liveView(r, liveStateFrom({ status: "not_found" }))).toMatchObject({ showInstall: false, notice: "missing", versionStatuses: false });
  });

  it("the built HTML of a static Hub page withholds the guide until the browser verifies; history stays", async () => {
    const r = await availableDetail();
    const pending = renderToStaticMarkup(createElement(ResourceDetailView, { resource: r, checkLive: true }));
    expect(pending).not.toContain("usar-en-runly");
    expect(pending).not.toContain(r.install!.releaseId);
    expect(pending).toContain('data-live-notice="checking"');
    expect(pending).toContain(r.title);
    expect(pending).toContain(r.license);
    expect(pending).toContain("Publicada");
    // Pages without a live check (fresh runtime data, fixtures) keep the guide.
    const fresh = renderToStaticMarkup(createElement(ResourceDetailView, { resource: r }));
    expect(fresh).toContain("usar-en-runly");
  });
});

describe("Marketplace indexing follows the sitemap opt-in", () => {
  it("is noindex without explicit authorization, even with real Hub data", async () => {
    const r = await availableDetail();
    expect(pageIsIndexable("hub", false)).toBe(false);
    expect(pageIsIndexable("hub", false, r)).toBe(false);
    expect(pageIsIndexable("hub", true, r)).toBe(true);
    expect(pageIsIndexable("fixtures", true, r)).toBe(false);
    expect(pageIsIndexable("hub", true, { ...r, listed: false })).toBe(false);
    expect(pageIsIndexable("hub", true, { ...r, indexable: false })).toBe(false);
    expect(pageIsIndexable("hub", true, { ...r, availability: "withdrawn" })).toBe(false);
  });
});
