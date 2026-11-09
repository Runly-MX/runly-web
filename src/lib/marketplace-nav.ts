// src/lib/marketplace-nav.ts
//
// The "Marketplace" entry in Header/Footer is ON by default: the catalog page
// renders an honest "in preparation" state while the Hub has no published
// resources. PUBLIC_MARKETPLACE_NAV=0 hides it (build-time kill switch).
// The Marketplace pages are Spanish-only, so links carry no locale prefix.
export const MARKETPLACE_NAV_HREF = "/marketplace/";
export const marketplaceNavEnabled = (env: { PUBLIC_MARKETPLACE_NAV?: string } = import.meta.env as { PUBLIC_MARKETPLACE_NAV?: string }) => env.PUBLIC_MARKETPLACE_NAV !== "0";
