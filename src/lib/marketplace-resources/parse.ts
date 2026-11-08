// src/lib/marketplace-resources/parse.ts
//
// Defensive parsing of PUBLIC_PROJECTIONS_CONTRACT_V1 payloads. Every field is
// untrusted: unknown fields are ignored (contract section 1.3), malformed
// entries return null and are dropped, text is returned as plain text (never
// HTML) and previews can only point at the Hub preview route.
import { TRUST_LEVELS, type TrustLevel } from "../marketplace";
import {
  RESOURCE_TYPES,
  type Availability, type Compatibility, type FeedInfo, type Preview, type PublisherProfile, type PublisherRef, type Requirements,
  type ResourceDetail, type ResourceSummary, type ResourceType, type ResourceVersion, type RiskSummary, type SolutionComponent,
  type SolutionExtra,
} from "./types";

const NS: Record<ResourceType, string> = { studio_template: "studio", automation: "automation", website_template: "website", solution: "solution" };
const SLUG = /^[a-z][a-z0-9-]{1,46}[a-z0-9]$/;
const HANDLE = /^[a-z][a-z0-9-]{2,38}[a-z0-9]$/;
const HEX64 = /^[a-f0-9]{64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SEMVER = /^\d{1,9}\.\d{1,9}\.\d{1,9}(?:[-+][0-9A-Za-z.-]{1,100})?$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const CATEGORY = /^[a-z][a-z0-9-]{0,39}$/;
const PREVIEW_URL = /^\/api\/v1\/marketplace\/previews\/[a-f0-9]{64}$/;
const COMPONENT_ID = /^[a-z][a-z0-9_]{0,31}$/;
// eslint-disable-next-line no-control-regex -- strip control characters from catalog text
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : null);
const text = (v: unknown, max: number, min = 0): string | null => (typeof v === "string" && v.length >= min && v.length <= max ? v.normalize("NFC").replace(CONTROL, "") : null);
const strings = (v: unknown, maxItems: number, maxLen: number): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string" && s.length > 0 && s.length <= maxLen).map((s) => s.replace(CONTROL, "")).slice(0, maxItems) : []);
const int = (v: unknown): number | null => (Number.isSafeInteger(v) && (v as number) >= 0 ? (v as number) : null);
const isType = (v: unknown): v is ResourceType => typeof v === "string" && (RESOURCE_TYPES as readonly string[]).includes(v);
const isTrust = (v: unknown): v is TrustLevel => typeof v === "string" && (TRUST_LEVELS as readonly string[]).includes(v);
const isAvailability = (v: unknown): v is Availability => v === "available" || v === "withdrawn" || v === "revoked";

export const resourceKeyFor = (type: ResourceType, slug: string) => `${NS[type]}.${slug}`;
export const validSlug = (slug: unknown): slug is string => typeof slug === "string" && SLUG.test(slug) && !slug.includes("--");
export const validHandle = (handle: unknown): handle is string => typeof handle === "string" && HANDLE.test(handle);

export function parsePublisherRef(raw: unknown): PublisherRef | null {
  const p = obj(raw);
  const displayName = p && text(p.displayName, 120, 1);
  if (!p || !validHandle(p.handle) || !displayName || typeof p.verified !== "boolean") return null;
  return { handle: p.handle, displayName, verified: p.verified };
}

function parsePreview(raw: unknown): Preview | null {
  const p = obj(raw);
  const alt = p && text(p.alt, 200, 1);
  if (!p || !alt || typeof p.sha256 !== "string" || !HEX64.test(p.sha256) || typeof p.url !== "string" || !PREVIEW_URL.test(p.url) || !p.url.endsWith(p.sha256)) return null;
  // Never SVG; only the three raster types of the contract.
  if (p.contentType !== "image/webp" && p.contentType !== "image/png" && p.contentType !== "image/jpeg") return null;
  const width = int(p.width), height = int(p.height);
  if (!width || !height || width > 1920 || height > 1920) return null;
  return { sha256: p.sha256, url: p.url, contentType: p.contentType, width, height, alt };
}

function parseCompatibility(raw: unknown): Compatibility | null {
  const c = obj(raw), runly = obj(c?.runly), format = obj(c?.format);
  if (!c || !runly || !format || typeof runly.min !== "string" || !SEMVER.test(runly.min)) return null;
  const max = runly.max === null ? null : typeof runly.max === "string" && SEMVER.test(runly.max) ? runly.max : undefined;
  const name = text(format.name, 40, 1), version = int(format.version);
  if (max === undefined || !name || !version) return null;
  return { runly: { min: runly.min, max }, format: { name, version } };
}

export function parseResourceSummary(raw: unknown): ResourceSummary | null {
  const r = obj(raw);
  if (!r || !isType(r.type) || !validSlug(r.slug) || r.resourceKey !== resourceKeyFor(r.type, r.slug)) return null;
  const title = text(r.title, 160, 1), summary = text(r.summary, 280), license = text(r.license, 128, 1);
  const publisher = parsePublisherRef(r.publisher);
  if (!title || summary === null || !license || !publisher || !isTrust(r.trust) || !isAvailability(r.availability)) return null;
  if (typeof r.listed !== "boolean" || typeof r.indexable !== "boolean" || (r.locale !== "es" && r.locale !== "en")) return null;
  const updatedAt = typeof r.updatedAt === "string" && ISO.test(r.updatedAt) ? r.updatedAt : null;
  if (!updatedAt) return null;
  // Trust is cross-checked, never promoted: a revoked release can't read as trusted.
  if (r.availability === "revoked" && r.trust !== "revoked") return null;
  if (r.trust === "community-verified" && !publisher.verified) return null;
  let latest: ResourceSummary["latest"] = null;
  const l = obj(r.latest);
  if (l) {
    const size = int(l.size);
    if (typeof l.version !== "string" || !SEMVER.test(l.version) || typeof l.releaseId !== "string" || !UUID.test(l.releaseId) || typeof l.publishedAt !== "string" || !ISO.test(l.publishedAt) || typeof l.sha256 !== "string" || !HEX64.test(l.sha256) || !size) return null;
    latest = { version: l.version, releaseId: l.releaseId, publishedAt: l.publishedAt, sha256: l.sha256, size };
  }
  return {
    resourceKey: r.resourceKey as string, type: r.type, slug: r.slug, title, summary, publisher, trust: r.trust, availability: r.availability,
    listed: r.listed, indexable: r.indexable && r.listed && r.availability === "available", latest, license,
    compatibility: parseCompatibility(r.compatibility),
    categories: strings(r.categories, 5, 40).filter((c) => CATEGORY.test(c)),
    locale: r.locale, previews: (Array.isArray(r.previews) ? r.previews : []).slice(0, 6).map(parsePreview).filter((p): p is Preview => !!p),
    updatedAt,
  };
}

function parseRequirements(raw: unknown): Requirements {
  const r = obj(raw) ?? {};
  return { modules: strings(r.modules, 50, 80), fonts: strings(r.fonts, 50, 160), permissions: strings(r.permissions, 50, 120), services: strings(r.services, 100, 160), builder: typeof r.builder === "string" && SEMVER.test(r.builder) ? r.builder : null };
}

function parseRisk(raw: unknown): RiskSummary | null {
  const r = obj(raw);
  const count = r && int(r.externalEmailCount);
  if (!r || count === null || typeof r.hasChatChannels !== "boolean" || typeof r.hasAttachments !== "boolean" || typeof r.hasApprovals !== "boolean") return null;
  return { services: strings(r.services, 100, 160), httpHosts: strings(r.httpHosts, 50, 255), externalEmailCount: count, hasChatChannels: r.hasChatChannels, hasAttachments: r.hasAttachments, hasApprovals: r.hasApprovals, importsPaused: true };
}

function parseVersion(raw: unknown): ResourceVersion | null {
  const v = obj(raw), size = v && int(v.size);
  const changelog = v && text(v.changelog, 4000);
  if (!v || !size || changelog === null || typeof v.version !== "string" || !SEMVER.test(v.version) || typeof v.releaseId !== "string" || !UUID.test(v.releaseId)) return null;
  if (v.status !== "published" && v.status !== "withdrawn" && v.status !== "revoked") return null;
  if (typeof v.publishedAt !== "string" || !ISO.test(v.publishedAt) || typeof v.sha256 !== "string" || !HEX64.test(v.sha256)) return null;
  const rep = obj(v.replacement);
  return { version: v.version, releaseId: v.releaseId, status: v.status, publishedAt: v.publishedAt, sha256: v.sha256, size, changelog, replacement: rep && typeof rep.version === "string" && SEMVER.test(rep.version) ? { version: rep.version } : null };
}

function parseComponent(raw: unknown): SolutionComponent | null {
  const c = obj(raw);
  const title = c && text(c.title, 160, 1), license = c && text(c.license, 128, 1);
  if (!c || typeof c.id !== "string" || !COMPONENT_ID.test(c.id) || !title || !license || !isAvailability(c.availability) || typeof c.required !== "boolean") return null;
  const type = text(c.type, 40, 1), scope = text(c.scope, 40, 1);
  if (!type || !scope) return null;
  let ref: SolutionComponent["ref"] = null;
  const r = obj(c.ref);
  if (r && typeof r.resourceKey === "string" && validSlug(r.slug) && typeof r.releaseId === "string" && UUID.test(r.releaseId) && typeof r.sha256 === "string" && HEX64.test(r.sha256) && typeof r.version === "string" && SEMVER.test(r.version)) {
    ref = { kind: "resource", resourceKey: r.resourceKey, slug: r.slug, releaseId: r.releaseId, sha256: r.sha256, version: r.version };
  } else if (r && typeof r.moduleKey === "string" && r.moduleKey.length <= 80 && typeof r.version === "string" && SEMVER.test(r.version) && typeof r.sha256 === "string" && HEX64.test(r.sha256)) {
    ref = { kind: "module", moduleKey: r.moduleKey, version: r.version, sha256: r.sha256, trust: text(r.trust, 40) ?? "" };
  }
  return { id: c.id, type, scope, required: c.required, dependsOn: strings(c.dependsOn, 50, 32), ref, title, license, availability: c.availability };
}

function parseSolutionExtra(raw: Obj): SolutionExtra | null {
  const status = raw.aggregateStatus;
  if (status !== "available" && status !== "partial" && status !== "uninstallable" && status !== "revoked") return null;
  const params = (Array.isArray(raw.parameters) ? raw.parameters : []).slice(0, 20).flatMap((p) => {
    const o = obj(p), label = o && text(o.label, 120, 1), key = o && text(o.key, 32, 1), type = o && text(o.type, 40, 1);
    return o && label && key && type && typeof o.required === "boolean" ? [{ key, type, required: o.required, label, options: Array.isArray(o.options) ? strings(o.options, 20, 80) : null }] : [];
  });
  const licenses = (Array.isArray(raw.licenses) ? raw.licenses : []).slice(0, 50).flatMap((l) => {
    const o = obj(l), license = o && text(o.license, 128, 1);
    return o && license && typeof o.componentId === "string" && COMPONENT_ID.test(o.componentId) ? [{ componentId: o.componentId, license }] : [];
  });
  return {
    aggregateStatus: status,
    components: (Array.isArray(raw.components) ? raw.components : []).slice(0, 50).map(parseComponent).filter((c): c is SolutionComponent => !!c),
    installOrder: strings(raw.installOrder, 50, 32), parameters: params, licenses,
  };
}

/** `raw` is the `resource` object (or the `solution` object of /solutions/{slug}). */
export function parseResourceDetail(raw: unknown): ResourceDetail | null {
  const base = parseResourceSummary(raw), r = obj(raw);
  if (!base || !r) return null;
  const description = text(r.description, 4000);
  const format = obj(r.format);
  const formatName = format && text(format.name, 40, 1), formatVersion = format && int(format.version);
  if (description === null || !formatName || !formatVersion) return null;
  const prov = obj(r.provenance);
  const install = obj(r.install);
  const resourcePath = install && text(install.resourcePath, 120, 1);
  const solution = base.type === "solution" ? parseSolutionExtra(r) : null;
  if (base.type === "solution" && !solution) return null;
  return {
    ...base, description, requirements: parseRequirements(r.requirements),
    // Provenance is DECLARED by the publisher and shown as such, never as verified.
    provenance: { declaredBy: "publisher", note: prov ? text(prov.note, 400) : null },
    format: { name: formatName, version: formatVersion },
    riskSummary: base.type === "automation" ? parseRisk(r.riskSummary) : null,
    versions: (Array.isArray(r.versions) ? r.versions : []).slice(0, 200).map(parseVersion).filter((v): v is ResourceVersion => !!v),
    install: install && install.how === "in-runly" && typeof install.releaseId === "string" && UUID.test(install.releaseId) && resourcePath ? { how: "in-runly", releaseId: install.releaseId, resourcePath } : null,
    solution,
  };
}

export function parseFeed(raw: unknown): FeedInfo | null {
  const f = obj(raw), sequence = f && int(f.sequence);
  return f && sequence && typeof f.generatedAt === "string" && ISO.test(f.generatedAt) ? { sequence, generatedAt: f.generatedAt } : null;
}

export function parsePublisherProfile(raw: unknown): PublisherProfile | null {
  const p = obj(raw), ref = parsePublisherRef(raw), count = p && int(p.resourceCount);
  if (!p || !ref || count === null || (p.state !== "active" && p.state !== "revoked") || typeof p.memberSince !== "string" || !ISO.test(p.memberSince)) return null;
  return { ...ref, state: p.state, memberSince: p.memberSince, resourceCount: count, bio: text(p.bio, 400) };
}
