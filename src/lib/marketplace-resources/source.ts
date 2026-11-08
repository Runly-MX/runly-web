// src/lib/marketplace-resources/source.ts
//
// Build-time selection of the catalog source (used from page frontmatter only).
//   MARKETPLACE_SOURCE            "hub" | "fixtures". Default: fixtures under `astro dev`,
//                                 hub in a production build.
//   MARKETPLACE_ALLOW_FIXTURE_BUILD "1" lets a *build* use fixtures (local preview of the
//                                 static output). Without it a production build with
//                                 fixtures fails, so sample data cannot ship by accident.
//   PUBLIC_RUNLY_HUB_URL          Hub origin (default https://devs.runly.mx)
//   RUNLY_CATALOG_BUILD_FETCH     "0" skips the Hub fetch (offline builds).
//   RUNLY_CATALOG_REQUIRED        "1" fails the build when the Hub catalog is unavailable.
import { createHubSource } from "./client";
import type { CatalogSource, DataSource, ListResult } from "./types";

export function resolveSourceKind(env: { MARKETPLACE_SOURCE?: string; DEV?: boolean; MARKETPLACE_ALLOW_FIXTURE_BUILD?: string }): DataSource {
  const requested = env.MARKETPLACE_SOURCE === "fixtures" || env.MARKETPLACE_SOURCE === "hub" ? env.MARKETPLACE_SOURCE : env.DEV ? "fixtures" : "hub";
  if (requested === "fixtures" && !env.DEV && env.MARKETPLACE_ALLOW_FIXTURE_BUILD !== "1") {
    throw new Error("MARKETPLACE_SOURCE=fixtures in a build requires MARKETPLACE_ALLOW_FIXTURE_BUILD=1 (sample data must never be published).");
  }
  return requested;
}

export const sourceKind = (): DataSource => resolveSourceKind({ MARKETPLACE_SOURCE: import.meta.env.MARKETPLACE_SOURCE, DEV: import.meta.env.DEV, MARKETPLACE_ALLOW_FIXTURE_BUILD: import.meta.env.MARKETPLACE_ALLOW_FIXTURE_BUILD });

let source: Promise<CatalogSource> | null = null;
export const getBuildSource = () => (source ??= sourceKind() === "fixtures"
  ? import("./fixtures").then((m) => m.createFixtureSource())
  : Promise.resolve(createHubSource({ hubUrl: import.meta.env.PUBLIC_RUNLY_HUB_URL, timeoutMs: 15000 })));

let pending: Promise<ListResult> | null = null;
/** One list fetch per build, shared by every Marketplace page. */
export const loadCatalogForBuild = (): Promise<ListResult> => (pending ??= (async () => {
  if (sourceKind() === "hub" && import.meta.env.RUNLY_CATALOG_BUILD_FETCH === "0") return { status: "unavailable", source: "hub", fetchedAt: new Date().toISOString(), reason: "build_fetch_disabled", items: [] } as ListResult;
  const result = await (await getBuildSource()).list();
  if (result.status !== "ok") {
    if (import.meta.env.RUNLY_CATALOG_REQUIRED === "1") throw new Error(`RUNLY_MARKETPLACE_UNAVAILABLE: ${result.reason}`);
    console.warn(`[marketplace] resource catalog unavailable at build (${result.reason}); /marketplace renders the unavailable state.`);
  }
  return result;
})());
