// src/lib/marketplace-resources/fixtures.ts
//
// DEVELOPMENT / LOCAL PREVIEW DATA ONLY. These are NOT real resources and must
// never be published as such. They are written in the exact shape of
// PUBLIC_PROJECTIONS_CONTRACT_V1 and pass through the same parsers as Hub data.
// They are only reachable when MARKETPLACE_SOURCE=fixtures (the default under
// `astro dev`); a production build uses the Hub source, and every page built
// from fixtures is noindex, excluded from the sitemap and carries a permanent
// "sample data" banner. Every title starts with the FIXTURE_MARK.
import { parsePublisherProfile, parseResourceDetail, parseResourceSummary } from "./parse";
import type { CatalogSource, DetailResult, ListResult, PublisherProfile, PublisherResult, ResourceDetail, ResourceSummary, ResourceType } from "./types";

export const FIXTURE_MARK = "[Ejemplo]";
const NOW = "2026-11-08T12:00:00.000Z";
const hex = (c: string) => c.repeat(64);
const uuid = (n: number) => `${String(n).padStart(8, "0")}-0000-4000-8000-000000000000`;
const NS: Record<ResourceType, string> = { studio_template: "studio", automation: "automation", website_template: "website", solution: "solution" };

const PUBLISHERS = {
  runly: { handle: "runly-team", displayName: "Runly", verified: true },
  acme: { handle: "ejemplo-labs", displayName: "Ejemplo Labs", verified: true },
  indie: { handle: "ejemplo-indie", displayName: "Ejemplo Indie", verified: false },
};

interface Spec {
  type: ResourceType; slug: string; title: string; summary: string; publisher: keyof typeof PUBLISHERS;
  trust?: "official" | "community-verified" | "community" | "revoked"; availability?: "available" | "withdrawn" | "revoked";
  categories?: string[]; locale?: "es" | "en"; license?: string; n: number; description?: string;
  extra?: Record<string, unknown>;
}

function summaryOf(s: Spec) {
  const availability = s.availability ?? "available";
  const trust = s.trust ?? (availability === "revoked" ? "revoked" : s.publisher === "runly" ? "official" : PUBLISHERS[s.publisher].verified ? "community-verified" : "community");
  const formatName = { studio_template: "studio", automation: "automation", website_template: "website", solution: "solution" }[s.type];
  return {
    resourceKey: `${NS[s.type]}.${s.slug}`, type: s.type, slug: s.slug, title: `${FIXTURE_MARK} ${s.title}`, summary: s.summary,
    publisher: PUBLISHERS[s.publisher], trust, availability, listed: true, indexable: availability === "available",
    latest: { version: "1.0.0", releaseId: uuid(s.n), publishedAt: NOW, sha256: hex(String.fromCharCode(96 + (s.n % 6) + 1)), size: 4096 * s.n },
    license: s.license ?? "CC-BY-4.0",
    compatibility: { runly: { min: "1.0.0", max: null }, format: { name: formatName, version: 1 } },
    categories: s.categories ?? [], locale: s.locale ?? "es", previews: [], updatedAt: NOW,
  };
}

function detailOf(s: Spec) {
  const availability = s.availability ?? "available";
  const base = summaryOf(s);
  const status = availability === "available" ? "published" : availability;
  return {
    ...base,
    description: s.description ?? `${s.summary}\n\nContenido de ejemplo para revisar el diseño. No es un recurso real y no se puede instalar.`,
    requirements: { modules: [], fonts: s.type === "studio_template" ? ["Inter"] : [], permissions: [], services: s.type === "automation" ? ["runly.crm:contacts.read"] : [], builder: s.type === "website_template" ? "0.3.3" : null },
    provenance: { declaredBy: "publisher", note: "Declarado por el publicador de ejemplo." },
    format: base.compatibility.format,
    versions: [{ version: "1.0.0", releaseId: base.latest.releaseId, status, publishedAt: NOW, sha256: base.latest.sha256, size: base.latest.size, changelog: "Primera versión de ejemplo.", replacement: null }],
    install: { how: "in-runly", releaseId: base.latest.releaseId, resourcePath: "Marketplace" },
    ...s.extra,
  };
}

const specs: Spec[] = [
  { n: 1, type: "studio_template", slug: "menu-restaurante", title: "Menú de restaurante", summary: "Plantilla de menú de una página para restaurantes y cafeterías.", publisher: "acme", categories: ["restaurantes", "menus"] },
  { n: 2, type: "studio_template", slug: "tarjeta-de-presentacion", title: "Tarjeta de presentación", summary: "Tarjeta horizontal lista para imprimir con logotipo y datos de contacto.", publisher: "runly", categories: ["identidad"] },
  { n: 3, type: "studio_template", slug: "cartel-de-oferta", title: "Cartel de oferta", summary: "Cartel de precios para mostrador, retirado por su publicador.", publisher: "indie", availability: "withdrawn", categories: ["promociones"] },
  { n: 4, type: "automation", slug: "aviso-de-lead", title: "Aviso de nuevo lead", summary: "Automatización pausada que avisa al equipo cuando entra un contacto nuevo.", publisher: "runly", categories: ["ventas"],
    extra: { riskSummary: { services: ["runly.crm:contacts.read", "runly.chat:messages.send"], httpHosts: [], externalEmailCount: 0, hasChatChannels: true, hasAttachments: false, hasApprovals: false, importsPaused: true } } },
  { n: 5, type: "automation", slug: "recordatorio-de-cobro", title: "Recordatorio de cobro", summary: "Envía un recordatorio por correo antes del vencimiento de una factura.", publisher: "acme", categories: ["finanzas"],
    extra: { riskSummary: { services: ["runly.ledger:entries.read"], httpHosts: ["api.ejemplo.test"], externalEmailCount: 2, hasChatChannels: false, hasAttachments: true, hasApprovals: true, importsPaused: true } } },
  { n: 6, type: "automation", slug: "cierre-semanal", title: "Cierre semanal", summary: "Resumen semanal de actividad; revocada por una vulnerabilidad de ejemplo.", publisher: "indie", availability: "revoked", categories: ["finanzas"] },
  { n: 7, type: "website_template", slug: "restaurante", title: "Sitio para restaurante", summary: "Sitio de cinco páginas con menú, reservaciones y mapa.", publisher: "acme", categories: ["restaurantes"] },
  { n: 8, type: "website_template", slug: "consultorio", title: "Sitio para consultorio", summary: "Sitio sencillo con servicios, equipo y formulario de contacto.", publisher: "runly", categories: ["salud"], locale: "en" },
  {
    n: 9, type: "solution", slug: "restaurante-express", title: "Restaurante Express", summary: "Sitio, menús y aviso de leads para abrir tu restaurante en un día.", publisher: "runly", categories: ["restaurantes"], license: "MIT",
    extra: {
      aggregateStatus: "available", installOrder: ["website", "menus", "leads"],
      parameters: [{ key: "business_name", type: "string", required: true, label: "Nombre del negocio", options: null }, { key: "site", type: "site_reference", required: true, label: "Sitio destino", options: null }],
      components: [
        { id: "website", type: "website_template", scope: "site", required: true, dependsOn: [], title: `${FIXTURE_MARK} Sitio para restaurante`, license: "CC-BY-4.0", availability: "available", ref: { resourceKey: "website.restaurante", slug: "restaurante", releaseId: uuid(7), sha256: hex("c"), version: "1.0.0" } },
        { id: "menus", type: "studio_template", scope: "company", required: true, dependsOn: [], title: `${FIXTURE_MARK} Menú de restaurante`, license: "CC-BY-4.0", availability: "available", ref: { resourceKey: "studio.menu-restaurante", slug: "menu-restaurante", releaseId: uuid(1), sha256: hex("b"), version: "1.0.0" } },
        { id: "leads", type: "automation", scope: "company", required: false, dependsOn: ["website"], title: `${FIXTURE_MARK} Aviso de nuevo lead`, license: "MIT", availability: "available", ref: { resourceKey: "automation.aviso-de-lead", slug: "aviso-de-lead", releaseId: uuid(4), sha256: hex("e"), version: "1.0.0" } },
        { id: "crm", type: "module", scope: "instance", required: true, dependsOn: [], title: "Contactos", license: "Runly", availability: "available", ref: { moduleKey: "runly.contacts", version: "1.0.0", sha256: hex("f"), trust: "official" } },
      ],
      licenses: [{ componentId: "website", license: "CC-BY-4.0" }, { componentId: "menus", license: "CC-BY-4.0" }, { componentId: "leads", license: "MIT" }],
    },
  },
];

const PROFILES: PublisherProfile[] = Object.values(PUBLISHERS).map((p) => ({ ...p, state: "active" as const, memberSince: "2026-01-01T00:00:00.000Z", resourceCount: 0, bio: p.handle === "ejemplo-labs" ? "Publicador de ejemplo para la vista previa local." : null }));

function build(): { summaries: ResourceSummary[]; details: Map<string, ResourceDetail> } {
  const summaries: ResourceSummary[] = [];
  const details = new Map<string, ResourceDetail>();
  for (const spec of specs) {
    // Same parsers as production data: a fixture that violates the contract fails loudly here.
    const summary = parseResourceSummary(summaryOf(spec));
    const detail = parseResourceDetail(detailOf(spec));
    if (!summary || !detail) throw new Error(`Invalid marketplace fixture: ${spec.slug}`);
    summaries.push(summary);
    details.set(`${spec.type}/${spec.slug}`, detail);
  }
  return { summaries, details };
}

export function createFixtureSource(now: () => Date = () => new Date()): CatalogSource {
  const { summaries, details } = build();
  return {
    kind: "fixtures",
    async list(): Promise<ListResult> {
      return { status: "ok", source: "fixtures", fetchedAt: now().toISOString(), feed: { sequence: 1, generatedAt: NOW }, total: summaries.length, truncated: false, items: summaries };
    },
    async detail(type, slug): Promise<DetailResult> {
      const resource = details.get(`${type}/${slug}`);
      return resource ? { status: "ok", source: "fixtures", feed: { sequence: 1, generatedAt: NOW }, resource } : { status: "not_found" };
    },
    async publisher(handle): Promise<PublisherResult> {
      const base = PROFILES.find((p) => p.handle === handle);
      const items = summaries.filter((s) => s.publisher.handle === handle);
      const publisher = base && parsePublisherProfile({ ...base, resourceCount: items.length });
      return publisher ? { status: "ok", source: "fixtures", publisher, items } : { status: "not_found" };
    },
  };
}
