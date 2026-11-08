// src/lib/marketplace-resources/live.ts
//
// Current availability of a resource whose page was built earlier (static
// pages). The page never presents the resource as usable until the Hub has
// confirmed it now: while checking, after a network error or a timeout, the
// "Usar en Runly" guide and the release id stay hidden.
import type { DetailResult, ResourceDetail } from "./types";

export type LiveState =
  | { phase: "not_required" } // fresh data (runtime page) or development fixtures
  | { phase: "checking" }
  | { phase: "available" } // 200 with an available resource
  | { phase: "gone"; availability: "withdrawn" | "revoked"; replacement: { resourceKey: string; version: string } | null } // 410
  | { phase: "missing" } // 404: no longer public; the reason is unknown
  | { phase: "error" }; // network error, timeout or unexpected answer

export function liveStateFrom(result: DetailResult): LiveState {
  if (result.status === "ok") return result.resource.availability === "available" ? { phase: "available" } : { phase: "gone", availability: result.resource.availability === "revoked" ? "revoked" : "withdrawn", replacement: null };
  if (result.status === "gone") return { phase: "gone", availability: result.availability === "revoked" ? "revoked" : "withdrawn", replacement: result.replacement };
  if (result.status === "not_found") return { phase: "missing" };
  return { phase: "error" };
}

export interface LiveView {
  resource: ResourceDetail; // what to render (availability/trust adjusted when the Hub says so)
  showInstall: boolean; // "Usar en Runly" guide + release id
  notice: "checking" | "withdrawn" | "revoked" | "missing" | "error" | null;
  replacement: { resourceKey: string; version: string } | null;
  // Once the whole resource is confirmed unavailable, the built per-version
  // statuses are stale and a 410 does not say which applies to each version.
  versionStatuses: boolean;
}

export function liveView(built: ResourceDetail, state: LiveState): LiveView {
  const builtAvailable = built.availability === "available";
  switch (state.phase) {
    case "not_required":
      return { resource: built, showInstall: !!built.install && builtAvailable, notice: builtAvailable ? null : built.availability === "revoked" ? "revoked" : "withdrawn", replacement: null, versionStatuses: true };
    case "available":
      return { resource: built, showInstall: !!built.install && builtAvailable, notice: null, replacement: null, versionStatuses: true };
    case "checking":
      return { resource: built, showInstall: false, notice: "checking", replacement: null, versionStatuses: true };
    case "error":
      return { resource: built, showInstall: false, notice: "error", replacement: null, versionStatuses: true };
    case "gone":
      return {
        resource: { ...built, availability: state.availability, trust: state.availability === "revoked" ? "revoked" : built.trust },
        showInstall: false, notice: state.availability, replacement: state.replacement, versionStatuses: false,
      };
    case "missing":
      return { resource: built, showInstall: false, notice: "missing", replacement: null, versionStatuses: false };
  }
}
