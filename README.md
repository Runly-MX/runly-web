# Runly Web

Marketing site for [runly.mx](https://runly.mx) — RUNLY ERP, by Racoon Devs. Astro 5 (static site generation), Tailwind CSS, bilingual (ES/EN). Separate from the `runly-erp` application repository.

This is a **fully static site**: `pnpm build` emits plain HTML/CSS/JS into `dist/`, served directly by Nginx. There is no Node runtime, no adapter, and no Docker container in production.

## Development

Catalog v1 is prepared locally by `pnpm catalog:prepare --from <ledger-export>`.
The source index under public/catalog/v1 is empty; generated ZIPs stay outside
Git. Preparation verifies size, SHA-256 and the pinned Ed25519 key, copies no
keys/receipts, and does not deploy. TEST keys require `--fixture-key <file>` and
output under .artifacts/.

Requirements: Node 20+, pnpm.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Site runs at `http://localhost:4321` (Spanish) and `http://localhost:4321/en/` (English).

Run tests: `pnpm test`. Typecheck: `pnpm astro check`. Production build: `pnpm build`.

## Runly Developer public pages

The Spanish public pages share the existing site layout and legal content component.
Their content is maintained in `src/data/public-policies.ts`:

- Product: `https://runly.mx/runly-developer/`
- Support: `https://runly.mx/support/`
- Privacy policy: `https://runly.mx/privacy/`
- Terms of service: `https://runly.mx/terms/`

The previous `/privacy-notice`, `/terms-of-service` and `/support-contact` URLs,
including their `/en/` variants, remain accessible with the current Spanish
content and the corresponding new canonical URL. These pages do not advertise
an English translation. Footer links point to the current public pages.

The build generates static HTML and includes the new routes in the sitemap.
Local preparation does not publish these URLs; public access must be checked
after the normal authorized deployment before using them for submission.

## Environment variables

See `.env.example`.

| Variable | Purpose |
|---|---|
| `PUBLIC_SITE_URL` | Canonical site URL, used in SEO tags and the sitemap |
| `PUBLIC_RUNLY_API_URL` | The Runly ERP instance's API the contact form submits into. Copy the "apiUrl" field verbatim from Growth's "Ver código" (e.g. `https://app.runly.mx/api` — the instance may mount the API under a subpath) |
| `PUBLIC_RUNLY_COMPANY` | Company slug assigned to this site inside that ERP instance |
| `PUBLIC_RUNLY_SITE_ID` | This site's UUID inside the ERP's Website module, once `runly.mx` is registered there |
| `PUBLIC_RUNLY_CONTACT_FORM_ID` | UUID of the "contacto" form created in the Growth module's admin |
| `PUBLIC_RUNLY_SUPABASE_URL` / `PUBLIC_RUNLY_SUPABASE_ANON_KEY` | Only needed once auth/guest-chat are wired up here too — plain form submissions work without them |
| `PUBLIC_TURNSTILE_SITE_KEY` | Optional Cloudflare Turnstile site key for spam protection on the contact form |

All of these are `PUBLIC_`-prefixed and non-secret by design (same category as a Supabase anon key) — they get inlined into the static build and shipped to the browser. **No SMTP credentials or server secrets exist in this repository or build.** Delivery is owned entirely by the Growth module on the ERP side; see [Contact form](#contact-form) below.

## Marketplace on /modulos

Runly Developer Hub is the single source of truth for Marketplace modules. `/modulos` and `/en/modulos` read its public directory (`GET /api/v1/marketplace/directory`); this repository never keeps its own list of Marketplace modules. `src/data/modules.ts` still describes the modules **included in Runly** (`runly.*`, shipped with the platform and used by the documentation) and is shown as "Incluidos en Runly", not as a distribution catalog.

Strategy for a static site (no SSR): the directory is fetched **at build time** (SEO HTML and static pages `/modulos/<key>/` for listed, available releases) and **again in the browser** on every visit, replacing the build snapshot so releases revoked or withdrawn after the build disappear and new ones appear. If the browser refresh fails, the build snapshot stays, labelled with its date as possibly out of date. If the Hub was unreachable at build time, the build still succeeds and renders an honest "unavailable" state — modules are never invented. Unlisted links and releases newer than the build resolve at `/modulos/detalle/?key=custom.x` in the browser; that page is `noindex` and excluded from the sitemap. There is no install button: modules are installed from Runly (Modules > Marketplace), which verifies the signed feeds itself.

| Variable | Purpose |
|---|---|
| `PUBLIC_RUNLY_HUB_URL` | Developer Hub origin (default `https://devs.runly.mx`). Only HTTPS, or `http://localhost`/`127.0.0.1` for development |
| `RUNLY_CATALOG_BUILD_FETCH` | `0` skips the build-time fetch (offline builds) |
| `RUNLY_CATALOG_REQUIRED` | `1` fails the build when the Hub directory is unavailable |

SEO limitation: releases published after the last build have no indexable page until the next build (they are visible through the browser refresh and the `noindex` dynamic page). Rebuild/deploy after publications when indexing matters. If Nginx ever adds a Content-Security-Policy, `connect-src` must allow the Hub origin.

## Module documentation (help content)

`src/content/help/**/*.md` and the pages/endpoints under `/documentacion/modulos/` and `/api/modules/` are **not edited here**. The `runly` ERP monorepo (`../runly` in this dev layout) is the single source of truth — each module's help articles live at `apps/api/src/manifests/official/help/<moduleKey>/{overview.md,views/*.md}`, right next to that module's manifest (navigation, permissions), and are also what powers the in-app help panel inside a live Runly instance.

Whenever that content changes, bring a fresh copy into this repo and redeploy normally:

```bash
node scripts/sync-help-content.mjs [path-to-runly-repo]   # defaults to ../runly
pnpm build
# then the usual deploy: git commit the refreshed src/content/help/, push, pull on the VPS, pnpm build, copy dist/
```

This is a manual step (no CI automation yet) — run it, review the diff in `src/content/help/`, commit, deploy. The sync script fails loudly if the source path doesn't exist rather than silently producing an empty/stale collection.

Two consumers are generated at build time from that content (static, `output: "static"` — no server involved):
- Human pages: `/documentacion/modulos` (index) and `/documentacion/modulos/:moduleKey` (one page per module — overview + a section per documented screen). Spanish only for now; the content itself is Spanish-only.
- JSON: `/api/modules/index.json` and `/api/modules/:moduleKey/resumen.json` — same response shape as `GET /help/modules` / `GET /help/modules/:moduleKey` inside a live Runly instance, so an AI model or another consumer can treat this public source and an instance's own local one the same way.

`src/content.config.ts` defines the `help` collection with a **custom `generateId`** — the default id generator from Astro's `glob()` loader slugifies path segments (stripping dots), which silently turned every `moduleKey` like `runly.core` into `runlycore` (wrong in the URL, in the JSON `moduleKey` field, and when cross-referencing `src/data/modules.ts` by id). The custom `generateId` just strips the `.md` extension and keeps the rest of the relative path as-is.

See `docs/superpowers/specs/2026-09-27-public-help-docs-runly-web-design.md` in the `runly` repo for the full design (why the content stays in `runly`, why this is a manual sync rather than CI, and what's explicitly out of scope for v1: English translations, analytics on which articles get read, and the `runly` ERP side ever falling back to this public API).

## Content that must be confirmed before launch

- The hero product screenshot (`src/assets/tour/inicio.png`, optimized to WebP by `astro:assets`) is a real dashboard screenshot but still a placeholder in the sense that a cleaner/updated capture (or a short product video) may replace it later. The Open Graph cover image (`public/brand/og-cover.svg`) is still a placeholder illustration (the isotype on a brand-colored background), not a real product screenshot — replace it before launch. Note social platforms (Facebook/Twitter/LinkedIn link previews) generally do not render SVG for `og:image`, so the OG cover in particular should become a real PNG/JPG before going live.
- `PUBLIC_RUNLY_COMPANY`, `PUBLIC_RUNLY_SITE_ID`, and `PUBLIC_RUNLY_CONTACT_FORM_ID` must be set to real values (site registered in the Website module, form created in Growth) before launch, or the contact form will not submit.

## Deploy

The site is mostly static, with on-demand Marketplace profiles, resource details and sitemap.
`dist/client` alone is not a complete deployment. Astro's Node standalone runtime lives outside
Nginx's public root and is managed by systemd; only the dynamic Marketplace routes are proxied.

Follow [Marketplace hosting: setup, exact VPS commands and paired rollback](docs/MARKETPLACE_HOSTING.md).
The deployment prepares one immutable runtime release and reuses the existing guarded static
backup/apply/health workflow. A failed activation restores static files, Node and the Nginx snippet
together. After activation, the legacy static-only deploy/rollback refuses to detach that pair.

Keep the existing vhost, TLS, API locations and UTF-8 charset directives. Include
`/etc/nginx/snippets/runly-marketplace.conf` inside the HTTPS server before generic regex
locations. The ordinary static handler remains `try_files $uri $uri/ $uri.html =404`, never
an indiscriminate SPA fallback. No build or VPS changes are required for a new resource or
publisher once the runtime is active; static module pages retain their separate publication policy.

## Runly ERP integration (Growth)

This site is registered in Runly ERP's **Growth** module as an external site (Growth → Sitios conectados → Conectar sitio externo) and integrates via the npm package [`@raulbellosom/runly-sdk`](https://www.npmjs.com/package/@raulbellosom/runly-sdk) — this is "Pattern A" from that package's README (a build with its own bundler, as opposed to "Pattern C", the no-build `<script src=".../runly-sdk.js">` embed for plain HTML sites). `src/lib/runly-sdk.ts` creates a single shared client (`createStorefrontClient`) that both the analytics bootstrap and the contact form import — avoids opening two Supabase clients on the same page.

This requires, on the Runly ERP side:
1. `runly.mx` registered as a site in Growth's "Sitios conectados", giving `PUBLIC_RUNLY_SITE_ID`.
2. A "contacto" form created in the Growth module's admin, with field keys matching what `ContactSection.astro` submits (`fullName`, `companyName`, `email`, `phone`, `teamSize`, `interest`, `needs`, `consent`, `locale`) — its UUID is `PUBLIC_RUNLY_CONTACT_FORM_ID`.

When `PUBLIC_RUNLY_API_URL`/`PUBLIC_RUNLY_COMPANY` are unset, Vite statically resolves `runlySdk` to `null` and tree-shakes the entire SDK (and its bundled `@supabase/supabase-js`) out of the build — confirmed by comparing build output with/without those vars set. Once real values are filled in, the SDK lands in its own shared chunk instead.

### Analytics

`BaseLayout.astro` calls `runlySdk?.analytics.start()` on every page load, which respects whatever `analyticsMode` (`off` / `anonymous` / `consent_required`) is configured for this site in Growth. **This site has no cookie-consent banner**, so the bootstrap deliberately never calls `sdk.analytics.setConsent(...)` — if the site is set to `consent_required` in Growth, no analytics will actually persist until either the mode is changed to `anonymous` or a real consent banner is added here that calls `setConsent('granted')`. Click-tracking via `data-runly-event="..."` attributes is supported by the SDK but not added to any elements yet — add them to specific CTAs if/when that's wanted.

### Contact form

The form in `ContactSection.astro` is fully functional client-side (validation, honeypot, submit states) and submits directly into Growth via `runlySdk.forms.submit(formId, values, options)` — no custom backend lives in or next to this repo. Until the two ERP-side items above are set, the form fails loudly on submit instead of pretending to succeed.

Optional spam protection: set `PUBLIC_TURNSTILE_SITE_KEY` to render a Cloudflare Turnstile widget; left blank, the form still submits without it.

### Live chat (guestChat)

A floating chat button (`src/components/ChatWidgetIsland.tsx`, mounted once in `BaseLayout.astro` via `<ChatWidgetIsland client:idle />`) wraps the SDK's own `ChatWidget` React component, wired to the shared `runlySdk` client. This is the **only piece of this site that uses React** — `@astrojs/react` was added solely so this one prebuilt component could be reused instead of hand-rolling a chat UI; everything else stays plain Astro.

It renders nothing (not even an empty button) when:
- `PUBLIC_RUNLY_API_URL`/`PUBLIC_RUNLY_COMPANY` aren't set (`runlySdk` is `null`), or
- the ERP reports no chat availability — which is also what happens if the `runly.chat` module isn't installed/enabled on the instance, or no agents are online. `useGuestChat` fails soft on any `getAvailability()` error, so a missing module never breaks the page.

Needs no ERP-side setup beyond `runly.chat` being installed and enabled — no separate form/site registration like the contact form needs.

### Known SDK gap

`@raulbellosom/runly-sdk` currently ships without TypeScript declarations (`.d.ts`), even as of 0.5.6 — see `src/types/runly-sdk.d.ts` for the local ambient module workaround. Worth fixing upstream in the SDK's own repo at some point.
