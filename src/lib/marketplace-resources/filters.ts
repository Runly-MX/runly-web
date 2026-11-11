// src/lib/marketplace-resources/filters.ts
import { hasStaticPage } from "./routes";
import { RESOURCE_TYPES, type DataSource, type ResourceSummary, type ResourceType } from "./types";

export interface ResourceFilters { query?: string; type?: ResourceType | "all"; trust?: string; category?: string }

const fold = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Text the search box matches against (also written to data-search on each card). */
export const searchKey = (r: ResourceSummary) => fold([r.title, r.summary, r.resourceKey, r.publisher.displayName, r.categories.join(" ")].join(" "));

export function filterResources(items: ResourceSummary[], { query = "", type = "all", trust = "all", category = "" }: ResourceFilters = {}) {
  const needle = fold(query.trim());
  return items.filter((r) =>
    (type === "all" || r.type === type)
    && (trust === "all" || r.trust === trust)
    && (!category || r.categories.includes(category))
    && (!needle || searchKey(r).includes(needle)));
}

/** Only types that really have published (available) resources are offered: empty types are never announced. */
export const typesWithResources = (items: ResourceSummary[]): ResourceType[] =>
  RESOURCE_TYPES.filter((type) => items.some((r) => r.type === type && r.availability === "available"));

export const categoryFacets = (items: ResourceSummary[]) => [...new Set(items.flatMap((r) => r.categories))].sort((a, b) => a.localeCompare(b));

export const categoryLabel = (slug: string) => slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

export const groupPublishers = (items: ResourceSummary[]) => {
  const map = new Map<string, { publisher: ResourceSummary["publisher"]; count: number }>();
  for (const r of items) {
    const entry = map.get(r.publisher.handle);
    if (entry) entry.count++; else map.set(r.publisher.handle, { publisher: r.publisher, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.publisher.displayName.localeCompare(b.publisher.displayName));
};

/** Publishers that really get a profile page: only those with a statically generated resource (same rule as the profile route). */
export const publishersWithPages = (items: ResourceSummary[], source: DataSource) => groupPublishers(items.filter((r) => hasStaticPage(source, r)));

export type SortKey = "recent" | "official" | "name";
export const SORT_LABEL: Record<SortKey, string> = { recent: "Más recientes", official: "Oficiales primero", name: "Nombre (A-Z)" };
const TRUST_RANK: Record<string, number> = { official: 0, "community-verified": 1, community: 2, revoked: 3 };

export function sortResources(items: ResourceSummary[], sort: SortKey) {
  const recent = (a: ResourceSummary, b: ResourceSummary) => b.updatedAt.localeCompare(a.updatedAt);
  const by = { recent, official: (a: ResourceSummary, b: ResourceSummary) => TRUST_RANK[a.trust] - TRUST_RANK[b.trust] || recent(a, b), name: (a: ResourceSummary, b: ResourceSummary) => a.title.localeCompare(b.title, "es") }[sort];
  return [...items].sort(by);
}
