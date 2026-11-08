// src/lib/marketplace-resources/client.ts
//
// Data layer for the resource catalog, decoupled from the pages: pages talk to
// a CatalogSource. createHubSource() consumes PUBLIC_PROJECTIONS_CONTRACT_V1
// (GET /api/v1/marketplace/resources, /resources/{type}/{slug},
// /solutions/{slug}, /publishers/{handle}) once Developer Hub implements them;
// until then those requests fail and every caller shows an honest
// "unavailable" state. Nothing is ever invented here.
import { hubBaseUrl } from "../marketplace";
import { parseFeed, parsePublisherProfile, parseResourceDetail, parseResourceSummary, validHandle, validSlug } from "./parse";
import type { Availability, CatalogSource, DetailResult, ListResult, PublisherResult, ResourceSummary, ResourceType } from "./types";
import { RESOURCE_TYPES } from "./types";

type FetchLike = (input: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;
interface Options { hubUrl?: string | null; fetchImpl?: FetchLike; timeoutMs?: number; maxPages?: number; now?: () => Date }

const API = "/api/v1/marketplace";

export function createHubSource({ hubUrl, fetchImpl = fetch as unknown as FetchLike, timeoutMs = 8000, maxPages = 20, now = () => new Date() }: Options = {}): CatalogSource {
  const base = hubBaseUrl(hubUrl);

  async function getJson(path: string) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetchImpl(`${base}${API}${path}`, { signal: controller.signal, headers: { Accept: "application/json" } });
    } finally {
      clearTimeout(timer);
    }
  }
  const reason = (error: unknown) => ((error as Error)?.name === "AbortError" ? "timeout" : "network");
  const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null);

  return {
    kind: "hub",

    async list(): Promise<ListResult> {
      const fetchedAt = now().toISOString();
      try {
        const items: ResourceSummary[] = [];
        const seen = new Set<string>();
        let cursor: string | null = null, feed = null as ReturnType<typeof parseFeed>, total = 0, truncated = false;
        for (let page = 0; page < maxPages; page++) {
          const response = await getJson(`/resources?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
          if (!response.ok) return { status: "unavailable", source: "hub", fetchedAt, reason: `http_${response.status}`, items: [] };
          const body = obj(await response.json());
          if (!body || body.schemaVersion !== 1 || !Array.isArray(body.items) || !Number.isSafeInteger(body.total)) return { status: "unavailable", source: "hub", fetchedAt, reason: "schema", items: [] };
          feed = parseFeed(body.feed) ?? feed;
          total = body.total as number;
          truncated = truncated || body.truncated === true;
          for (const raw of body.items) {
            const item = parseResourceSummary(raw);
            // Hidden resources never enter the listing, whatever the producer sends.
            if (item && item.listed && !seen.has(item.resourceKey)) { seen.add(item.resourceKey); items.push(item); }
          }
          cursor = typeof body.nextCursor === "string" && body.nextCursor ? body.nextCursor : null;
          if (!cursor) break;
        }
        // Page budget exhausted with a cursor still pending: the catalog is incomplete.
        // Fail closed so a build never publishes a partial catalog as if it were whole.
        if (cursor) return { status: "unavailable", source: "hub", fetchedAt, reason: "incomplete_pagination", items: [] };
        return { status: "ok", source: "hub", fetchedAt, feed, total, truncated, items };
      } catch (error) {
        return { status: "unavailable", source: "hub", fetchedAt, reason: reason(error), items: [] };
      }
    },

    async detail(type: ResourceType, slug: string): Promise<DetailResult> {
      if (!RESOURCE_TYPES.includes(type) || !validSlug(slug)) return { status: "not_found" };
      try {
        const response = await getJson(type === "solution" ? `/solutions/${encodeURIComponent(slug)}` : `/resources/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`);
        if (response.status === 404) return { status: "not_found" };
        const body = obj(await response.json().catch(() => null));
        if (response.status === 410) {
          const availability: Availability = body?.availability === "revoked" ? "revoked" : "withdrawn";
          const rep = obj(body?.replacement);
          return { status: "gone", availability, replacement: rep && typeof rep.resourceKey === "string" && typeof rep.version === "string" ? { resourceKey: rep.resourceKey, version: rep.version } : null };
        }
        if (!response.ok) return { status: "unavailable", reason: `http_${response.status}` };
        if (!body || body.schemaVersion !== 1) return { status: "unavailable", reason: "schema" };
        const resource = parseResourceDetail(type === "solution" ? body.solution : body.resource);
        // The URL decides identity: a payload for a different resource is rejected.
        if (!resource || resource.type !== type || resource.slug !== slug) return { status: "unavailable", reason: "schema" };
        return { status: "ok", source: "hub", feed: parseFeed(body.feed), resource };
      } catch (error) {
        return { status: "unavailable", reason: reason(error) };
      }
    },

    async publisher(handle: string): Promise<PublisherResult> {
      if (!validHandle(handle)) return { status: "not_found" };
      try {
        const response = await getJson(`/publishers/${encodeURIComponent(handle)}`);
        if (response.status === 404) return { status: "not_found" };
        if (!response.ok) return { status: "unavailable", reason: `http_${response.status}` };
        const body = obj(await response.json());
        const publisher = parsePublisherProfile(body?.publisher);
        if (!body || body.schemaVersion !== 1 || !publisher || publisher.handle !== handle || !Array.isArray(body.items)) return { status: "unavailable", reason: "schema" };
        const items = body.items.map(parseResourceSummary).filter((r): r is ResourceSummary => !!r && r.listed);
        return { status: "ok", source: "hub", publisher, items };
      } catch (error) {
        return { status: "unavailable", reason: reason(error) };
      }
    },
  };
}

/** Absolute URL for a preview image (always on the Hub origin; the parser only admits the Hub preview route). */
export const previewUrl = (hubUrl: string | null | undefined, preview: { url: string }) => `${hubBaseUrl(hubUrl)}${preview.url}`;
