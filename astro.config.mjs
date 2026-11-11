// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import node from "@astrojs/node";
import { marketplaceSitemapAllows } from "./scripts/marketplace-sitemap-filter.mjs";

export default defineConfig({
  site: "https://runly.mx",
  // Only Marketplace profiles/details render on demand; other routes stay static.
  adapter: node({ mode: "standalone" }),
  output: "static",
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      customSitemaps: process.env.MARKETPLACE_SOURCE !== "fixtures" && process.env.MARKETPLACE_SITEMAP === "1" ? ["https://runly.mx/marketplace/sitemap.xml"] : [],
      // Runtime-resolved Marketplace pages (unlisted/new releases) are noindex.
      // /marketplace/* follows its own opt-in policy (see the helper).
      filter: (page) => !page.includes("/modulos/detalle/") && marketplaceSitemapAllows(page),
      i18n: {
        defaultLocale: "es",
        locales: { es: "es-MX", en: "en-US" },
      },
    }),
    // React only for the guestChat floating widget (@raulbellosom/runly-sdk's
    // ChatWidget) — everything else on this site stays plain Astro/no framework.
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
