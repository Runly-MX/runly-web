// src/components/marketplace/resources/ResourceDetailView.tsx
//
// Detail sheet for any resource type. Pure presentation of a parsed
// ResourceDetail: all text is rendered as React text nodes (never HTML), the
// only action is "copy release id" (no downloads, no installs: those happen
// inside Runly). Used by the static pages and by the runtime loader.
import { useEffect, useState } from "react";
import { createHubSource } from "../../../lib/marketplace-resources/client";
import PreviewGallery from "./PreviewGallery";
import { liveStateFrom, liveView, type LiveState } from "../../../lib/marketplace-resources/live";
import { categoryLabel } from "../../../lib/marketplace-resources/filters";
import { MARKETPLACE_BASE, publisherPath, resourcePath, typePath } from "../../../lib/marketplace-resources/routes";
import { T, TYPE_TEXT } from "../../../lib/marketplace-resources/text";
import type { ResourceDetail } from "../../../lib/marketplace-resources/types";
import { AvailabilityChip, Panel, TrustBadge, TYPE_COVER, TypeChip } from "./parts";
import ResourceStateBlock from "./ResourceStateBlock";

const d = T.detail;
const L = T.live;
const date = (iso: string) => new Date(iso).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
const bytes = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable: the value stays selectable */ }
  };
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 flex items-stretch gap-2">
        <code className="min-w-0 flex-1 select-all break-all rounded-lg bg-slate-100 px-2.5 py-2 text-xs text-slate-700">{value}</code>
        <button type="button" onClick={copy} className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50" aria-live="polite">{copied ? d.copied : d.copy}</button>
      </div>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{children}</dd>
    </div>
  );
}

// Static pages are built once, so `checkLive` asks the Hub for the CURRENT
// availability before presenting the resource as usable (see live.ts).
function useLiveState(r: ResourceDetail, hubUrl: string | null | undefined, enabled: boolean): [LiveState, () => void] {
  const [state, setState] = useState<LiveState>(enabled ? { phase: "checking" } : { phase: "not_required" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setState({ phase: "checking" });
    createHubSource({ hubUrl }).detail(r.type, r.slug)
      .then((result) => { if (alive) setState(liveStateFrom(result, r)); })
      .catch(() => { if (alive) setState({ phase: "error" }); });
    return () => { alive = false; };
  }, [enabled, hubUrl, r.type, r.slug, attempt]);
  return [state, () => setAttempt((n) => n + 1)];
}

function LiveNotice({ kind, onRetry }: { kind: "checking" | "missing" | "error"; onRetry: () => void }) {
  const copy = { checking: [L.checkingTitle, L.checkingBody, "border-slate-200 bg-slate-50 text-slate-700"], missing: [L.missingTitle, L.missingBody, "border-slate-200 bg-slate-50 text-slate-700"], error: [L.errorTitle, L.errorBody, "border-amber-200 bg-amber-50 text-amber-900"] }[kind];
  return (
    <div className={`rounded-3xl border p-4 ${copy[2]}`} role={kind === "error" ? "alert" : "status"} aria-live="polite" data-live-notice={kind}>
      <p className="font-bold">{copy[0]}</p>
      <p className="mt-1 text-sm">{copy[1]}</p>
      {kind === "error" && <button type="button" onClick={onRetry} className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">{T.states.retry}</button>}
    </div>
  );
}

export default function ResourceDetailView({ resource: built, hubUrl, backHref, checkLive = false }: { resource: ResourceDetail; hubUrl?: string | null; backHref?: string; checkLive?: boolean }) {
  const [live, retry] = useLiveState(built, hubUrl, checkLive);
  const view = liveView(built, live);
  const r = view.resource;
  const req = r.requirements;
  const requirementRows = ([[d.modules, req.modules], [d.fonts, req.fonts], [d.permissions, req.permissions], [d.services, req.services]] as const).filter(([, v]) => v.length > 0);
  const hasRequirements = requirementRows.length > 0 || !!req.builder;
  const paragraphs = r.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const sol = r.solution;

  return (
    <article data-resource={r.resourceKey} data-availability={r.availability} data-live={live.phase}>
      <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <a href={`${MARKETPLACE_BASE}/`} className="font-semibold text-orange-600 hover:underline">{T.breadcrumbHome}</a>
        <span aria-hidden="true">/</span>
        <a href={typePath(r.type)} className="hover:text-slate-800">{TYPE_TEXT[r.type].plural}</a>
        <span aria-hidden="true">/</span>
        <span className="text-slate-700">{r.title}</span>
      </nav>

      {view.notice && (
        <div className="mb-6">
          {view.notice === "withdrawn" || view.notice === "revoked"
            ? <ResourceStateBlock kind={view.notice} replacement={view.replacement} compact />
            : <LiveNotice kind={view.notice} onRetry={retry} />}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start" data-detail-hero>
        <div>
          {r.previews.length > 0
            ? <PreviewGallery previews={r.previews} hubUrl={hubUrl} />
            : (
              <div className={`flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-gradient-to-br ${TYPE_COVER[r.type]}`} data-cover-fallback role="img" aria-label={TYPE_TEXT[r.type].singular}>
                <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">{TYPE_TEXT[r.type].singular}</span>
                <span className="text-xs font-medium opacity-80">{d.noPreview}</span>
              </div>
            )}
        </div>

        <div className="space-y-5">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <TypeChip type={r.type} />
              <TrustBadge trust={r.trust} />
              <AvailabilityChip availability={r.availability} trust={r.trust} />
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{r.title}</h1>
            <p className="mt-3 text-base text-slate-600">{r.summary}</p>
          </header>

          <a href={publisherPath(r.publisher.handle)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-orange-300 hover:bg-orange-50/40" data-publisher>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white" aria-hidden="true">{r.publisher.displayName.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")}</span>
            <span className="min-w-0">
              <span className="block text-xs text-slate-500">{d.publishedBy}</span>
              <span className="block truncate font-bold text-slate-900">{r.publisher.displayName}</span>
            </span>
            {r.publisher.verified && <span className="ml-auto shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{T.verifiedPublisher}</span>}
          </a>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 text-sm" data-facts>
            {([
              [d.version, r.latest ? T.version(r.latest.version) : "—"],
              [d.compatibility, r.compatibility ? d.requiresRunly(r.compatibility.runly.min, r.compatibility.runly.max) : "—"],
              [T.licenseLabel, r.license],
              [T.languageLabel, T.locale[r.locale]],
            ] as const).map(([label, value]) => (
              <div key={label} className="bg-white p-3">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          {r.install && view.showInstall && (
            <section className="rounded-3xl border border-orange-200 bg-orange-50/60 p-5" aria-labelledby="usar-en-runly">
              <h2 id="usar-en-runly" className="text-lg font-bold text-slate-900">{d.howTo}</h2>
              <p className="mt-1 text-sm text-slate-600">{d.howToIntro}</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
                {d.steps(r.install.resourcePath).map((s) => <li key={s}>{s}</li>)}
              </ol>
              <div className="mt-4"><CopyField label={d.releaseId} value={r.install.releaseId} /></div>
            </section>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Panel title={d.description}>
            {paragraphs.length ? paragraphs.map((p, i) => <p key={i} className="whitespace-pre-line leading-relaxed">{p}</p>) : <p>{r.summary}</p>}
          </Panel>

          {r.riskSummary && (
            <Panel title={d.risk}>
              <p>{d.riskNote}</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>{d.riskPaused}</li>
                <li>{d.riskEmails(r.riskSummary.externalEmailCount)}</li>
                {r.riskSummary.hasChatChannels && <li>{d.riskChat}</li>}
                {r.riskSummary.hasAttachments && <li>{d.riskAttachments}</li>}
                {r.riskSummary.hasApprovals && <li>{d.riskApprovals}</li>}
              </ul>
              {r.riskSummary.services.length > 0 && <TagList label={d.riskServices} values={r.riskSummary.services} />}
              {r.riskSummary.httpHosts.length > 0 && <TagList label={d.riskHosts} values={r.riskSummary.httpHosts} />}
            </Panel>
          )}

          {sol && (
            <Panel title={d.components} id="componentes">
              <p>{d.aggregate[sol.aggregateStatus]}</p>
              <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                {sol.components.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3" data-component={c.id}>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {c.ref?.kind === "resource" ? <a href={resourcePath(c.type as never, c.ref.slug)} className="hover:text-orange-600">{c.title}</a> : c.title}
                      </p>
                      <p className="text-xs text-slate-500">{c.type === "module" ? d.componentModule : (TYPE_TEXT[c.type as keyof typeof TYPE_TEXT]?.singular ?? c.type)} · {c.license}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AvailabilityChip availability={c.availability} />
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${c.required ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-300"}`}>{c.required ? d.componentRequired : d.componentOptional}</span>
                    </div>
                  </li>
                ))}
              </ul>
              {sol.parameters.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-900">{d.parameters}</p>
                  <ul className="mt-1 list-disc pl-5">
                    {sol.parameters.map((p) => <li key={p.key}>{p.label}{p.required ? ` (${d.parameterRequired.toLowerCase()})` : ""}</li>)}
                  </ul>
                </div>
              )}
              {sol.licenses.length > 0 && <TagList label={d.licenses} values={[...new Set(sol.licenses.map((l) => l.license))]} />}
            </Panel>
          )}

          <Panel title={d.requirements}>
            {hasRequirements ? (
              <dl>
                {requirementRows.map(([label, values]) => <Meta key={label} label={label}>{values.join(", ")}</Meta>)}
                {req.builder && <Meta label={d.builder}>{req.builder}</Meta>}
              </dl>
            ) : <p>{d.none}</p>}
          </Panel>

          {r.versions.length > 0 && (
            <Panel title={d.versions}>
              {!view.versionStatuses && <p data-versions-history>{L.versionsHistory}</p>}
              <ul className="space-y-3">
                {r.versions.map((v) => (
                  <li key={v.releaseId} className="rounded-2xl border border-slate-200 p-3" data-version={v.version} data-status={v.status}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{T.version(v.version)}</p>
                      <p className="text-xs text-slate-500">{view.versionStatuses ? `${d.status[v.status]} · ` : ""}{date(v.publishedAt)} · {bytes(v.size)}</p>
                    </div>
                    {v.changelog && <p className="mt-1 whitespace-pre-line">{v.changelog}</p>}
                    {v.replacement && <p className="mt-1 font-medium text-amber-800">{d.replacedBy(v.replacement.version)}</p>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <dl>
              <Meta label="Formato">{d.format(r.format.name, r.format.version)}</Meta>
              {r.latest && <Meta label={d.published}>{date(r.latest.publishedAt)}</Meta>}
            </dl>
            {r.categories.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-1.5">
                {r.categories.map((c) => <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{categoryLabel(c)}</span>)}
              </p>
            )}
            <div className="mt-4"><CopyField label={d.resourceKey} value={r.resourceKey} /></div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900">{d.provenance}</h2>
            <p className="mt-1 text-sm text-slate-600">{r.provenance.note ?? d.noProvenance}</p>
            <p className="mt-2 text-xs text-slate-500">{d.provenanceNote}</p>
          </section>
        </aside>
      </div>

      {backHref && <p className="mt-10"><a href={backHref} className="text-sm font-semibold text-orange-600 hover:underline">&larr; {T.states.backToCatalog}</a></p>}
    </article>
  );
}

function TagList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-1 flex flex-wrap gap-1.5">{values.map((v) => <span key={v} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{v}</span>)}</p>
    </div>
  );
}
