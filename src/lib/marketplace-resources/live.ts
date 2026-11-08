// src/lib/marketplace-resources/live.ts
//
// Current availability of a resource whose page was built earlier (static
// pages). The Hub's CURRENT answer is the source of truth: the page never
// presents the resource as usable, nor shows its previews, until the Hub has
// confirmed it now; and once it has, the page shows the Hub's current data
// (version, release id, previews, requirements, risk, version states), never
// the built copy.
import type { DetailResult, ResourceDetail } from "./types";

export type LiveState =
  | { phase: "not_required" } // fresh data (runtime page) or development fixtures
  | { phase: "checking" }
  | { phase: "available"; resource: ResourceDetail } // 200 with the current, available resource
  | { phase: "gone"; availability: "withdrawn" | "revoked"; replacement: { resourceKey: string; version: string } | null } // 410
  | { phase: "missing" } // 404: no longer public; the reason is unknown
  | { phase: "error" }; // network error, timeout or an unexpected answer

/** `built` is the page's resource: an answer about any other resource is never trusted. */
export function liveStateFrom(result: DetailResult, built: Pick<ResourceDetail, "resourceKey" | "type" | "slug">): LiveState {
  if (result.status === "ok") {
    const current = result.resource;
    if (current.resourceKey !== built.resourceKey || current.type !== built.type || current.slug !== built.slug) return { phase: "error" };
    // A 200 is only "usable" when the Hub itself says the resource is available and offers an install target.
    if (current.availability !== "available") return { phase: "gone", availability: current.availability === "revoked" ? "revoked" : "withdrawn", replacement: null };
    return { phase: "available", resource: current };
  }
  if (result.status === "gone") return { phase: "gone", availability: result.availability === "revoked" ? "revoked" : "withdrawn", replacement: result.replacement };
  if (result.status === "not_found") return { phase: "missing" };
  return { phase: "error" };
}

export interface LiveView {
  resource: ResourceDetail; // what to render
  showInstall: boolean; // "Usar en Runly" guide + release id
  notice: "checking" | "withdrawn" | "revoked" | "missing" | "error" | null;
  replacement: { resourceKey: string; version: string } | null;
  // Once the whole resource is confirmed unavailable, the built per-version
  // statuses are stale and a 410 does not say which applies to each version.
  versionStatuses: boolean;
}

// Unconfirmed or unavailable: keep the general, historical information, but no
// previews or install target that could read as currently available.
const historical = (built: ResourceDetail): ResourceDetail => ({ ...built, previews: [] });

export function liveView(built: ResourceDetail, state: LiveState): LiveView {
  const builtAvailable = built.availability === "available";
  switch (state.phase) {
    case "not_required":
      return { resource: built, showInstall: !!built.install && builtAvailable, notice: builtAvailable ? null : built.availability === "revoked" ? "revoked" : "withdrawn", replacement: null, versionStatuses: true };
    case "available":
      return { resource: state.resource, showInstall: !!state.resource.install, notice: null, replacement: null, versionStatuses: true };
    case "checking":
      return { resource: historical(built), showInstall: false, notice: "checking", replacement: null, versionStatuses: true };
    case "error":
      return { resource: historical(built), showInstall: false, notice: "error", replacement: null, versionStatuses: true };
    case "gone":
      return {
        resource: { ...historical(built), availability: state.availability, trust: state.availability === "revoked" ? "revoked" : built.trust },
        showInstall: false, notice: state.availability, replacement: state.replacement, versionStatuses: false,
      };
    case "missing":
      return { resource: historical(built), showInstall: false, notice: "missing", replacement: null, versionStatuses: false };
  }
}
