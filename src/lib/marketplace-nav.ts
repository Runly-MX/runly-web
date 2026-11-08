// src/lib/marketplace-nav.ts
//
// The "Marketplace" entry in Header/Footer is prepared but OFF by default:
// PUBLIC_MARKETPLACE_NAV=1 turns it on (build-time). /modulos stays its own
// entry either way. The Marketplace pages are Spanish-only, so the link has
// no locale prefix.
export const MARKETPLACE_NAV_HREF = "/marketplace/";
export const marketplaceNavEnabled = (env: { PUBLIC_MARKETPLACE_NAV?: string } = import.meta.env as { PUBLIC_MARKETPLACE_NAV?: string }) => env.PUBLIC_MARKETPLACE_NAV === "1";
