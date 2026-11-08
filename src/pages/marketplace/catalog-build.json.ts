// src/pages/marketplace/catalog-build.json.ts
//
// Build marker: which signed feed sequence this static Marketplace was built
// from. scripts/marketplace-feed-check.mjs compares it with the Hub to decide
// whether a rebuild is needed. It never triggers a deploy, and static pages
// only change on the next build.
import type { APIRoute } from "astro";
import { loadCatalogForBuild, sourceKind } from "../../lib/marketplace-resources/source";

export const prerender = true;

export const GET: APIRoute = async () => {
  const list = await loadCatalogForBuild();
  const feed = list.status === "ok" ? list.feed ?? null : null;
  return new Response(JSON.stringify({ schemaVersion: 1, source: sourceKind(), status: list.status, feed, resources: list.items.length, builtAt: new Date().toISOString() }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
