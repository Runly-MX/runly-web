// src/components/marketplace/resources/ResourceStateBlock.tsx
//
// One component for every non-happy state of the catalog: loading, empty,
// unavailable, not found, withdrawn, revoked and the development-fixture notice.
// Rendered statically by Astro pages and dynamically by the runtime loader.
import { MARKETPLACE_BASE } from "../../../lib/marketplace-resources/routes";
import { T } from "../../../lib/marketplace-resources/text";

export type StateKind = "loading" | "empty" | "unavailable" | "not_found" | "withdrawn" | "revoked" | "fixture";

interface Props {
  kind: StateKind;
  replacement?: { resourceKey: string; version: string } | null;
  onRetry?: () => void;
  compact?: boolean;
  showBack?: boolean;
}

const COPY: Record<StateKind, { title: string; body: string; tone: string }> = {
  loading: { title: T.states.loadingTitle, body: T.states.loadingBody, tone: "border-slate-200 bg-slate-50 text-slate-700" },
  empty: { title: T.states.emptyTitle, body: T.states.emptyBody, tone: "border-dashed border-slate-300 bg-slate-50 text-slate-700" },
  unavailable: { title: T.states.unavailableTitle, body: T.states.unavailableBody, tone: "border-amber-200 bg-amber-50 text-amber-900" },
  not_found: { title: T.states.notFoundTitle, body: T.states.notFoundBody, tone: "border-slate-200 bg-slate-50 text-slate-700" },
  withdrawn: { title: T.states.withdrawnTitle, body: T.states.withdrawnBody, tone: "border-amber-200 bg-amber-50 text-amber-900" },
  revoked: { title: T.states.revokedTitle, body: T.states.revokedBody, tone: "border-red-200 bg-red-50 text-red-900" },
  fixture: { title: T.states.fixtureTitle, body: T.states.fixtureBody, tone: "border-violet-200 bg-violet-50 text-violet-900" },
};

export default function ResourceStateBlock({ kind, replacement, onRetry, compact = false, showBack = false }: Props) {
  const copy = COPY[kind];
  const alert = kind === "revoked" || kind === "unavailable";
  return (
    <div
      className={`rounded-3xl border ${copy.tone} ${compact ? "p-4" : "p-8 text-center"}`}
      role={alert ? "alert" : "status"}
      aria-live={kind === "loading" ? "polite" : undefined}
      data-state={kind}
    >
      {kind === "loading" && (
        <div className="mx-auto mb-4 grid max-w-md gap-2" aria-hidden="true">
          <div className="h-3 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-3/5 animate-pulse rounded-full bg-slate-200" />
        </div>
      )}
      <p className="font-bold">{copy.title}</p>
      <p className={`mt-1 text-sm ${compact ? "" : "mx-auto max-w-xl"}`}>{copy.body}</p>
      {replacement && <p className="mt-2 text-sm font-semibold">{T.states.replacement(replacement.resourceKey, replacement.version)}</p>}
      {(onRetry || showBack) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {onRetry && <button type="button" onClick={onRetry} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">{T.states.retry}</button>}
          {showBack && <a href={`${MARKETPLACE_BASE}/`} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{T.states.backToCatalog}</a>}
        </div>
      )}
    </div>
  );
}
