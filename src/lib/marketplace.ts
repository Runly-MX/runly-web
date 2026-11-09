// src/lib/marketplace.ts
//
// runly.mx consumer of the Developer Hub public catalog directory
// (GET /api/v1/marketplace/directory). Developer Hub is the single source of
// truth: this site never keeps its own list of Marketplace modules. Used both at
// build time (SEO HTML + static detail pages) and in the browser (fresh data).
// The directory is a presentation projection; installation happens only inside
// Runly, which verifies the signed feeds itself.
//
// Every field is treated as untrusted data: normalized here and rendered as
// text (Astro escaping / textContent), never as HTML.

export const DEFAULT_HUB_URL = "https://devs.runly.mx";
export const TRUST_LEVELS = ["official", "community-verified", "community", "revoked"] as const;
export type TrustLevel = (typeof TRUST_LEVELS)[number];
export type Locale = "es" | "en";

export interface MarketplaceModule {
  key: string;
  name: string;
  description: string;
  version: string;
  trust: "official" | "community";
  trustLevel: TrustLevel;
  publisher: { handle: string; displayName: string; verified: boolean } | null;
  availability: "available" | "withdrawn" | "revoked" | "unavailable";
  listed: boolean;
  indexable: boolean;
  capabilities: string[];
  dependencies: string[];
  compatibility: { runly: { min: string; max: string | null } } | null;
  icon: string;
  color: string;
  changelog: string;
  publishedAt: string | null;
  sha256: string | null;
}

export type DirectoryResult =
  | { status: "ok"; fetchedAt: string; modules: MarketplaceModule[]; snapshots: { official: number | null; community: number | null } }
  | { status: "unavailable"; fetchedAt: string; reason: string; modules: [] };

const KEY = /^custom\.[a-z][a-z0-9_]{1,39}$/;
const HANDLE = /^[a-z][a-z0-9-]{2,38}[a-z0-9]$/;
const VERSION = /^\d{1,9}\.\d{1,9}\.\d{1,9}(?:[-+][0-9A-Za-z.-]{1,100})?$/;
const ICON = /^[A-Z][A-Za-z0-9]{0,63}$/;
const COLOR = /^#[0-9a-fA-F]{6}$/;
const HEX64 = /^[a-f0-9]{64}$/;
// eslint-disable-next-line no-control-regex -- strip control characters from catalog text
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

const text = (value: unknown, max: number): string | null => (typeof value === "string" && value.length <= max ? value.replace(CONTROL, "") : null);
const list = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.length > 0 && v.length <= 160).slice(0, 200) : []);
export const validModuleKey = (key: unknown): key is string => typeof key === "string" && KEY.test(key);

// Returns null for anything inconsistent. Trust is taken from the producer's
// structured fields and cross-checked; it is never inferred from names.
export function normalizeModule(raw: unknown): MarketplaceModule | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const m = raw as Record<string, unknown>;
  const name = text(m.name, 160), description = text(m.description, 4000) ?? "", version = text(m.version, 128);
  if (!validModuleKey(m.key) || !name || !version || !VERSION.test(version)) return null;
  if (m.trust !== "official" && m.trust !== "community") return null;
  if (!TRUST_LEVELS.includes(m.trustLevel as TrustLevel)) return null;
  const trustLevel = m.trustLevel as TrustLevel;
  let publisher: MarketplaceModule["publisher"] = null;
  if (m.trust === "official") {
    // Official means Runly's own channel: no publisher, never another level.
    if (m.publisher !== null || (trustLevel !== "official" && trustLevel !== "revoked")) return null;
  } else {
    const p = m.publisher as Record<string, unknown> | null;
    const displayName = text(p?.displayName, 80);
    if (!p || typeof p.handle !== "string" || !HANDLE.test(p.handle) || !displayName || trustLevel === "official") return null;
    if (trustLevel === "community-verified" && p.verified !== true) return null;
    publisher = { handle: p.handle, displayName, verified: p.verified === true };
  }
  const availability = ["available", "withdrawn", "revoked", "unavailable"].includes(m.availability as string) ? (m.availability as MarketplaceModule["availability"]) : "unavailable";
  const runly = (m.compatibility as { runly?: { min?: unknown; max?: unknown } } | null)?.runly;
  const compatibility = runly && typeof runly.min === "string" && VERSION.test(runly.min) && (runly.max === null || (typeof runly.max === "string" && VERSION.test(runly.max))) ? { runly: { min: runly.min, max: (runly.max as string | null) ?? null } } : null;
  const publishedAt = typeof m.publishedAt === "string" && Number.isFinite(Date.parse(m.publishedAt)) ? new Date(m.publishedAt).toISOString() : null;
  return {
    key: m.key, name, description, version, trust: m.trust, trustLevel, publisher, availability,
    listed: m.listed === true, indexable: m.indexable === true && m.listed === true && availability === "available" && trustLevel !== "revoked",
    capabilities: list(m.capabilities), dependencies: list(m.dependencies), compatibility,
    icon: typeof m.icon === "string" && ICON.test(m.icon) ? m.icon : "Boxes",
    color: typeof m.color === "string" && COLOR.test(m.color) ? m.color : "#2563EB",
    changelog: text(m.changelog, 4000) ?? "", publishedAt, sha256: typeof m.sha256 === "string" && HEX64.test(m.sha256) ? m.sha256 : null,
  };
}

// Only HTTPS hubs, plus loopback for local development.
export function hubBaseUrl(value: string | undefined | null): string {
  try {
    const url = new URL(value || DEFAULT_HUB_URL);
    const loopback = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
    if ((url.protocol === "https:" || loopback) && !url.username && !url.password) return url.origin;
  } catch { /* fall through */ }
  return DEFAULT_HUB_URL;
}

type FetchLike = (input: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

// Reads every page of the listed directory. Any failure yields "unavailable":
// callers show an honest state, never invented or stale-as-current modules.
export async function fetchDirectory({ hubUrl, fetchImpl = fetch as unknown as FetchLike, timeoutMs = 8000, maxPages = 20, now = () => new Date() }: { hubUrl?: string | null; fetchImpl?: FetchLike; timeoutMs?: number; maxPages?: number; now?: () => Date } = {}): Promise<DirectoryResult> {
  const base = hubBaseUrl(hubUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const modules: MarketplaceModule[] = [];
    const seen = new Set<string>();
    let snapshots = { official: null as number | null, community: null as number | null };
    for (let page = 0, offset = 0; page < maxPages; page++) {
      const response = await fetchImpl(`${base}/api/v1/marketplace/directory?limit=100&offset=${offset}`, { signal: controller.signal, headers: { Accept: "application/json" } });
      if (!response.ok) return { status: "unavailable", fetchedAt: now().toISOString(), reason: `http_${response.status}`, modules: [] };
      const body = (await response.json()) as { schemaVersion?: unknown; total?: unknown; modules?: unknown; catalogs?: { official?: { sequence?: unknown } | null; community?: { sequence?: unknown } | null } };
      if (body?.schemaVersion !== 1 || !Array.isArray(body.modules) || typeof body.total !== "number") return { status: "unavailable", fetchedAt: now().toISOString(), reason: "schema", modules: [] };
      const sequence = (value: unknown) => (Number.isSafeInteger(value) ? (value as number) : null);
      snapshots = { official: sequence(body.catalogs?.official?.sequence), community: sequence(body.catalogs?.community?.sequence) };
      for (const raw of body.modules) {
        const module = normalizeModule(raw);
        if (module && module.listed && module.trustLevel !== "revoked" && !seen.has(module.key)) { seen.add(module.key); modules.push(module); }
      }
      offset += body.modules.length;
      if (!body.modules.length || offset >= body.total) break;
    }
    return { status: "ok", fetchedAt: now().toISOString(), modules, snapshots };
  } catch (error) {
    return { status: "unavailable", fetchedAt: now().toISOString(), reason: (error as Error)?.name === "AbortError" ? "timeout" : "network", modules: [] };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchModule(key: string, { hubUrl, fetchImpl = fetch as unknown as FetchLike, timeoutMs = 8000 }: { hubUrl?: string | null; fetchImpl?: FetchLike; timeoutMs?: number } = {}): Promise<{ status: "ok"; module: MarketplaceModule } | { status: "not_found" | "unavailable" }> {
  if (!validModuleKey(key)) return { status: "not_found" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${hubBaseUrl(hubUrl)}/api/v1/marketplace/modules/${encodeURIComponent(key)}`, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (response.status === 404) return { status: "not_found" };
    if (!response.ok) return { status: "unavailable" };
    const body = (await response.json()) as { current?: unknown; versions?: unknown[] };
    const module = normalizeModule(body?.current ?? (Array.isArray(body?.versions) ? body.versions[0] : null));
    return module ? { status: "ok", module } : { status: "not_found" };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}

export function filterModules(modules: MarketplaceModule[], { query = "", trust = "all", capability = "" }: { query?: string; trust?: string; capability?: string } = {}) {
  const needle = query.trim().toLowerCase();
  return modules.filter((m) => (trust === "all" || (trust === "community" ? m.trust === "community" : m.trustLevel === trust))
    && (!capability || m.capabilities.includes(capability))
    && (!needle || [m.key, m.name, m.description, m.publisher?.displayName ?? "Runly"].some((v) => v.toLowerCase().includes(needle))));
}

export const capabilityFacets = (modules: MarketplaceModule[]) => [...new Set(modules.flatMap((m) => m.capabilities))].sort((a, b) => a.localeCompare(b));

export const MARKETPLACE_TEXT = {
  es: {
    eyebrow: "Catálogo comunitario",
    title: "Módulos para instalar en Runly",
    description: "Catálogo publicado en Runly Developer Hub: módulos oficiales de Runly y de publicadores de la comunidad. Se instalan desde Runly, en Módulos > Marketplace.",
    builtInTitle: "Incluidos en Runly",
    builtInDescription: "Estos módulos vienen con la plataforma y se actualizan con ella; no se instalan desde el Marketplace.",
    search: "Buscar módulos",
    searchPlaceholder: "Nombre, clave o publicador",
    capability: "Capacidad",
    allCapabilities: "Todas las capacidades",
    filters: { all: "Todos", official: "Oficial Runly", "community-verified": "Comunidad verificada", community: "Comunidad" },
    trust: { official: "Oficial Runly", "community-verified": "Comunidad verificada", community: "Comunidad", revoked: "Revocado" } as Record<TrustLevel, string>,
    trustHint: { official: "Publicado y firmado por Runly.", "community-verified": "Identidad del publicador verificada. No es un módulo oficial de Runly.", community: "Publicador de la comunidad sin verificación de identidad.", revoked: "Revocado: no instalable." } as Record<TrustLevel, string>,
    availability: { available: "Disponible", withdrawn: "Retirado por el publicador", revoked: "Revocado", unavailable: "No disponible" },
    version: "Versión",
    publisher: "Publicador",
    runly: "Runly",
    compatibility: "Compatibilidad",
    requiresRunly: (min: string, max: string | null) => (max ? `Runly ${min} a ${max}` : `Runly ${min} o posterior`),
    capabilities: "Capacidades",
    dependencies: "Requiere",
    changelog: "Cambios de esta versión",
    published: "Publicado",
    details: "Ver detalle",
    installFromRunly: "Disponible desde Runly",
    installHint: "Instálalo desde tu instancia de Runly en Módulos > Marketplace. Runly verifica la firma, la huella SHA-256 y la compatibilidad antes de instalar.",
    viewInHub: "Ver en Developer Hub",
    empty: "Aún no hay módulos publicados en el Marketplace.",
    noResults: "Ningún módulo coincide con los filtros.",
    loading: "Consultando el catálogo…",
    updated: "Catálogo actualizado desde Runly Developer Hub.",
    unavailable: "El catálogo de módulos no está disponible en este momento. Inténtalo más tarde.",
    stale: (date: string) => `No pudimos actualizar el catálogo. Se muestra la información del ${date}, que puede estar desactualizada.`,
    notFound: "Este módulo no existe o ya no está disponible.",
    noLongerAvailable: "Este módulo ya no está disponible para nuevas instalaciones.",
    back: "Volver al catálogo de módulos",
    detailMetaSuffix: "Marketplace de RUNLY",
  },
  en: {
    eyebrow: "Marketplace",
    title: "Modules to install in Runly",
    description: "Catalog published on Runly Developer Hub: official Runly modules and community publishers' modules. Install them from Runly, under Modules > Marketplace.",
    builtInTitle: "Included in Runly",
    builtInDescription: "These modules ship with the platform and update with it; they are not installed from the Marketplace.",
    search: "Search modules",
    searchPlaceholder: "Name, key, or publisher",
    capability: "Capability",
    allCapabilities: "All capabilities",
    filters: { all: "All", official: "Runly Official", "community-verified": "Community Verified", community: "Community" },
    trust: { official: "Runly Official", "community-verified": "Community Verified", community: "Community", revoked: "Revoked" } as Record<TrustLevel, string>,
    trustHint: { official: "Published and signed by Runly.", "community-verified": "Publisher identity verified. Not an official Runly module.", community: "Community publisher without identity verification.", revoked: "Revoked: not installable." } as Record<TrustLevel, string>,
    availability: { available: "Available", withdrawn: "Withdrawn by its publisher", revoked: "Revoked", unavailable: "Unavailable" },
    version: "Version",
    publisher: "Publisher",
    runly: "Runly",
    compatibility: "Compatibility",
    requiresRunly: (min: string, max: string | null) => (max ? `Runly ${min} to ${max}` : `Runly ${min} or later`),
    capabilities: "Capabilities",
    dependencies: "Requires",
    changelog: "Changes in this version",
    published: "Published",
    details: "View details",
    installFromRunly: "Available from Runly",
    installHint: "Install it from your Runly instance under Modules > Marketplace. Runly verifies the signature, the SHA-256 fingerprint, and compatibility before installing.",
    viewInHub: "View on Developer Hub",
    empty: "No modules have been published to the Marketplace yet.",
    noResults: "No module matches the filters.",
    loading: "Checking the catalog…",
    updated: "Catalog refreshed from Runly Developer Hub.",
    unavailable: "The module catalog is unavailable right now. Please try again later.",
    stale: (date: string) => `We couldn't refresh the catalog. Showing information from ${date}, which may be out of date.`,
    notFound: "This module doesn't exist or is no longer available.",
    noLongerAvailable: "This module is no longer available for new installations.",
    back: "Back to the module catalog",
    detailMetaSuffix: "RUNLY Marketplace",
  },
};

export const moduleDetailPath = (locale: Locale, key: string) => `${locale === "en" ? "/en" : ""}/modulos/${key}/`;
export const dynamicDetailPath = (locale: Locale, key: string) => `${locale === "en" ? "/en" : ""}/modulos/detalle/?key=${encodeURIComponent(key)}`;
export const hubModuleUrl = (hubUrl: string | null | undefined, key: string) => `${hubBaseUrl(hubUrl)}/marketplace/modules/${encodeURIComponent(key)}`;
