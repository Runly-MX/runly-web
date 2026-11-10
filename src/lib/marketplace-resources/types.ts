// src/lib/marketplace-resources/types.ts
//
// Types for the public resource catalog (Studio templates, automations,
// Website templates and Solutions), shaped after PUBLIC_PROJECTIONS_CONTRACT_V1
// (runly-developer-hub/docs/architecture/marketplace-solutions/contracts/).
// This is a presentation projection: the web never verifies signatures and never
// installs anything. Installation happens only inside Runly.
import type { TrustLevel } from "../marketplace";

export const RESOURCE_TYPES = ["studio_template", "automation", "website_template", "solution"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type Availability = "available" | "withdrawn" | "revoked";
export type ResourceLocale = "es" | "en";

export interface PublisherRef { handle: string; displayName: string; verified: boolean }
export interface Preview { sha256: string; url: string; contentType: "image/webp" | "image/png" | "image/jpeg"; width: number; height: number; alt: string }
export interface Compatibility { runly: { min: string; max: string | null }; format: { name: string; version: number } }
export interface LatestRelease { version: string; releaseId: string; publishedAt: string; sha256: string; size: number }

export interface ResourceSummary {
  resourceKey: string;
  type: ResourceType;
  slug: string;
  title: string;
  summary: string;
  publisher: PublisherRef;
  trust: TrustLevel;
  officialAttestation?: unknown;
  availability: Availability;
  listed: boolean;
  indexable: boolean;
  latest: LatestRelease | null;
  license: string;
  compatibility: Compatibility | null;
  categories: string[];
  locale: ResourceLocale;
  previews: Preview[];
  updatedAt: string;
}

export interface Requirements { modules: string[]; fonts: string[]; permissions: string[]; services: string[]; builder: string | null }
export interface ResourceVersion { version: string; releaseId: string; status: "published" | "withdrawn" | "revoked"; publishedAt: string; sha256: string; size: number; changelog: string; replacement: { version: string } | null }
export interface RiskSummary { services: string[]; httpHosts: string[]; externalEmailCount: number; hasChatChannels: boolean; hasAttachments: boolean; hasApprovals: boolean; importsPaused: true }

export type SolutionComponentRef =
  | { kind: "resource"; resourceKey: string; slug: string; releaseId: string; sha256: string; version: string }
  | { kind: "module"; moduleKey: string; version: string; sha256: string; trust: string };
export interface SolutionComponent { id: string; type: string; scope: string; required: boolean; dependsOn: string[]; ref: SolutionComponentRef | null; title: string; license: string; availability: Availability }
export interface SolutionParameter { key: string; type: string; required: boolean; label: string; options: string[] | null }
export interface SolutionExtra {
  aggregateStatus: "available" | "partial" | "uninstallable" | "revoked";
  components: SolutionComponent[];
  installOrder: string[];
  parameters: SolutionParameter[];
  licenses: { componentId: string; license: string }[];
}

export interface ResourceDetail extends ResourceSummary {
  description: string;
  requirements: Requirements;
  provenance: { declaredBy: "publisher"; note: string | null };
  format: { name: string; version: number };
  riskSummary: RiskSummary | null;
  versions: ResourceVersion[];
  install: { how: "in-runly"; releaseId: string; resourcePath: string } | null;
  solution: SolutionExtra | null;
}

export interface PublisherProfile { handle: string; displayName: string; verified: boolean; state: "active" | "revoked"; memberSince: string; resourceCount: number; bio: string | null }

export interface FeedInfo { sequence: number; generatedAt: string }
export type DataSource = "hub" | "fixtures";

export type ListResult =
  | { status: "ok"; source: DataSource; fetchedAt: string; feed: FeedInfo | null; total: number; truncated: boolean; items: ResourceSummary[] }
  | { status: "unavailable"; source: DataSource; fetchedAt: string; reason: string; items: [] };

export type DetailResult =
  | { status: "ok"; source: DataSource; feed: FeedInfo | null; resource: ResourceDetail }
  | { status: "not_found" }
  | { status: "gone"; availability: Availability; replacement: { resourceKey: string; version: string } | null }
  | { status: "unavailable"; reason: string };

export type PublisherResult =
  | { status: "ok"; source: DataSource; publisher: PublisherProfile; items: ResourceSummary[] }
  | { status: "not_found" }
  | { status: "unavailable"; reason: string };

/** Everything a page needs; the Hub client and the dev fixtures both implement it. */
export interface CatalogSource {
  kind: DataSource;
  list(): Promise<ListResult>;
  detail(type: ResourceType, slug: string): Promise<DetailResult>;
  publisher(handle: string): Promise<PublisherResult>;
}
