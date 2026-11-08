// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { marketplaceSitemapAllows } from "./scripts/marketplace-sitemap-filter.mjs";

export default defineConfig({
  site: "https://runly.mx",
  // Static Site Generation: `pnpm build` emits plain HTML/CSS/JS into dist/,
  // served by Nginx directly. No Node runtime, no adapter, no Docker.
  // The contact form submits into the Runly ERP's Growth module via
  // @raulbellosom/runly-sdk (see README's Contact form section).
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
