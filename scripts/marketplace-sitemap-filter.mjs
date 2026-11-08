// scripts/marketplace-sitemap-filter.mjs
//
// Sitemap policy for /marketplace/*, shared by astro.config.mjs and its test.
// Marketplace URLs are advertised only when ALL hold:
//   - the build did not use development fixtures (MARKETPLACE_SOURCE !== "fixtures"),
//   - the release explicitly opted in (MARKETPLACE_SITEMAP=1, set once the Hub
//     catalog really has published resources; an empty catalog is noindex),
//   - the URL is not the runtime-resolved page (/marketplace/detalle/).
export function marketplaceSitemapAllows(url, env = process.env) {
  if (!url.includes("/marketplace/")) return true;
  return env.MARKETPLACE_SOURCE !== "fixtures" && env.MARKETPLACE_SITEMAP === "1" && !url.includes("/marketplace/detalle/");
}
