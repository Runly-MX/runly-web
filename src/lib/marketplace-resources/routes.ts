// src/lib/marketplace-resources/routes.ts
//
// Public URL structure (DEC-X1: type + slug rebuild the resourceKey, no lookup table).
import { RESOURCE_TYPES, type DataSource, type ResourceSummary, type ResourceType } from "./types";

export const MARKETPLACE_BASE = "/marketplace";

export const TYPE_SEGMENT: Record<ResourceType, string> = {
  studio_template: "plantillas-studio",
  automation: "automatizaciones",
  website_template: "plantillas-website",
  solution: "soluciones",
};

export const typeFromSegment = (segment: string | undefined): ResourceType | null =>
  RESOURCE_TYPES.find((type) => TYPE_SEGMENT[type] === segment) ?? null;

export const typePath = (type: ResourceType) => `${MARKETPLACE_BASE}/${TYPE_SEGMENT[type]}/`;
export const resourcePath = (type: ResourceType, slug: string) => `${MARKETPLACE_BASE}/${TYPE_SEGMENT[type]}/${slug}/`;
export const publisherPath = (handle: string) => `${MARKETPLACE_BASE}/publicadores/${handle}/`;
/** Runtime-resolved page for releases published after the build (noindex, never in the sitemap). */
export const runtimeResourcePath = (type: ResourceType, slug: string) => `${MARKETPLACE_BASE}/detalle/?type=${encodeURIComponent(type)}&slug=${encodeURIComponent(slug)}`;

/**
 * Which resources get a static page. Production (Hub) pages exist only for
 * listed, indexable, available resources, so the sitemap never advertises
 * hidden or withdrawn ones; everything else is reachable only through the
 * noindex runtime page. Development fixtures get a page for every state so the
 * withdrawn/revoked screens can be previewed.
 */
export const hasStaticPage = (source: DataSource, resource: ResourceSummary) =>
  source === "fixtures" || (resource.indexable && resource.listed && resource.availability === "available");

/** Fixture data and an unpublished catalog must never be indexed. */
export const pageIsIndexable = (source: DataSource, resource?: ResourceSummary) =>
  source === "hub" && (resource ? resource.indexable && resource.listed && resource.availability === "available" : true);

export const pathForSummary = (r: ResourceSummary) => resourcePath(r.type, r.slug);
