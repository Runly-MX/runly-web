// src/components/marketplace/resources/ResourceGallery.tsx
//
// The Marketplace catalog as a gallery: search, type tabs, a collapsible filter
// panel (side column on desktop, drawer on phones) and a masonry of tiles that
// keep each preview's real format. One island for the home, the type pages and
// the publisher profile. With `initialItems` it renders that data (fixtures,
// publisher profile); otherwise it reads the live Hub catalog in the browser and
// refreshes it, so resources published after the build appear without a rebuild.
// Filters here are custom controls (no native selects), themed like the rest.
import { useEffect, useMemo, useRef, useState } from "react";
import { createHubSource } from "../../../lib/marketplace-resources/client";
import { SORT_LABEL, categoryFacets, categoryLabel, filterResources, sortResources, type SortKey } from "../../../lib/marketplace-resources/filters";
import { MARKETPLACE_BASE, typePath } from "../../../lib/marketplace-resources/routes";
import { T, TYPE_TEXT } from "../../../lib/marketplace-resources/text";
import { RESOURCE_TYPES, type ListResult, type ResourceSummary, type ResourceType } from "../../../lib/marketplace-resources/types";
import { Icon, TYPE_ICON } from "./icons";
import MarketplaceAbout from "./MarketplaceAbout";
import { FOCUS, ToggleChip } from "./parts";
import ResourceStateBlock from "./ResourceStateBlock";
import ResourceTile from "./ResourceTile";

interface Props { hubUrl?: string; type?: ResourceType; initialItems?: ResourceSummary[]; syncUrl?: boolean }

const TRUSTS = ["official", "community-verified", "community"] as const;
const SKELETON = [220, 300, 180, 260, 320, 200, 280, 240];
const toolbarBtn = `relative inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 motion-reduce:transition-none ${FOCUS}`;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset className="min-w-0 border-0 p-0"><legend className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{title}</legend><div className="flex flex-wrap gap-2">{children}</div></fieldset>;
}

export default function ResourceGallery({ hubUrl, type: initialType, initialItems, syncUrl = false }: Props) {
  const [result, setResult] = useState<ListResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ResourceType | "all">(initialType ?? "all");
  const [trust, setTrust] = useState("all");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [panel, setPanel] = useState(false);
  const [about, setAbout] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (initialItems) return;
    let alive = true;
    const load = () => createHubSource({ hubUrl }).list().then((r) => { if (alive) setResult(r); });
    load();
    const timer = setInterval(load, 60000);
    window.addEventListener("focus", load);
    return () => { alive = false; clearInterval(timer); window.removeEventListener("focus", load); };
  }, [hubUrl, initialItems, attempt]);
  useEffect(() => { if (panel && window.matchMedia("(max-width: 1023px)").matches) closeRef.current?.focus(); }, [panel]);

  const all = initialItems ?? (result?.status === "ok" ? result.items : []);
  const tabs = RESOURCE_TYPES.filter((t) => all.some((r) => r.type === t && r.availability === "available") || (t === "studio_template" && !initialItems));
  const inTab = useMemo(() => all.filter((r) => tab === "all" || r.type === tab), [all, tab]);
  const categories = useMemo(() => categoryFacets(inTab), [inTab]);
  const visible = useMemo(() => sortResources(filterResources(inTab, { query, trust, category }), sort), [inTab, query, trust, category, sort]);
  const activeFilters = (trust !== "all" ? 1 : 0) + (category ? 1 : 0);
  const trusts = TRUSTS.filter((t) => inTab.some((r) => r.trust === t));
  const clear = () => { setQuery(""); setTrust("all"); setCategory(""); };
  const pick = (next: ResourceType | "all") => {
    setTab(next); setCategory("");
    if (syncUrl) { try { history.replaceState(null, "", next === "all" ? `${MARKETPLACE_BASE}/` : typePath(next)); } catch { /* URL sync is optional */ } }
  };

  const loading = !initialItems && !result;
  const failed = !initialItems && result && result.status !== "ok";

  return (
    <section aria-label={T.eyebrow} data-mk-catalog onKeyDown={(e) => { if (e.key === "Escape" && panel && !about) setPanel(false); }}>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">{T.search}</span>
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search" maxLength={80} autoComplete="off" value={query} data-mk-q
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape" && query) { e.preventDefault(); setQuery(""); } }}
            placeholder={T.searchPlaceholder}
            className={`h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-12 pr-11 text-base text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 [&::-webkit-search-cancel-button]:hidden`}
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Borrar búsqueda" className={`absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 ${FOCUS}`}><Icon name="x" className="h-4 w-4" /></button>}
        </label>
        <button type="button" aria-expanded={panel} aria-controls="mk-filters" aria-label="Filtros" onClick={() => setPanel(!panel)} className={toolbarBtn}>
          <Icon name="sliders" className="h-4 w-4" /><span className="hidden sm:inline">Filtros</span>
          {activeFilters > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white">{activeFilters}</span>}
        </button>
        <button type="button" onClick={() => setAbout(true)} aria-label="Acerca del Marketplace" title="Acerca del Marketplace" className={toolbarBtn}><Icon name="info" className="h-4 w-4" /></button>
      </form>

      {tabs.length > 0 && (
        <div role="group" aria-label={T.nav.sections} className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none]">
          <ToggleChip on={tab === "all"} onClick={() => pick("all")}>{T.all}</ToggleChip>
          {tabs.map((t) => (
            <ToggleChip key={t} on={tab === t} onClick={() => pick(t)} count={all.filter((r) => r.type === t).length}><Icon name={TYPE_ICON[t]} className="h-4 w-4" />{TYPE_TEXT[t].plural}</ToggleChip>
          ))}
        </div>
      )}

      <p className="mb-4 mt-5 text-sm font-medium text-slate-500" data-mk-count role="status" aria-live="polite">{loading ? T.states.loadingTitle : failed ? "" : T.results(visible.length)}</p>

      <div className="lg:flex lg:items-start lg:gap-8">
        {panel && <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setPanel(false)} aria-hidden="true" />}
        <aside id="mk-filters" hidden={!panel} aria-label="Filtros" onKeyDown={(e) => { if (e.key === "Escape") setPanel(false); }} className="fixed inset-y-0 left-0 z-50 w-[min(22rem,92vw)] flex-col border-r border-slate-200 bg-white shadow-2xl [&:not([hidden])]:flex lg:sticky lg:top-24 lg:z-auto lg:w-64 lg:shrink-0 lg:rounded-2xl lg:border lg:shadow-none lg:max-h-[calc(100dvh-7rem)]">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h2 className="text-base font-bold text-slate-900">Filtros</h2>
            <button ref={closeRef} type="button" onClick={() => setPanel(false)} aria-label="Cerrar filtros" className={`flex h-11 w-11 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 ${FOCUS}`}><Icon name="x" className="h-5 w-5" /></button>
          </div>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {trusts.length > 1 && (
              <Group title="Procedencia">
                <ToggleChip on={trust === "all"} onClick={() => setTrust("all")}>{T.all}</ToggleChip>
                {trusts.map((t) => <ToggleChip key={t} on={trust === t} onClick={() => setTrust(t)}>{T.trust[t]}</ToggleChip>)}
              </Group>
            )}
            {categories.length > 0 && (
              <Group title={T.categoryFilter}>
                <ToggleChip on={!category} onClick={() => setCategory("")}>{T.allCategories}</ToggleChip>
                {categories.map((c) => <ToggleChip key={c} on={category === c} onClick={() => setCategory(c)}>{categoryLabel(c)}</ToggleChip>)}
              </Group>
            )}
            <Group title="Ordenar por">
              {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => <ToggleChip key={k} on={sort === k} onClick={() => setSort(k)}>{SORT_LABEL[k]}</ToggleChip>)}
            </Group>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
            <button type="button" onClick={clear} disabled={!activeFilters && !query} className={`min-h-11 rounded-lg px-2 text-sm font-semibold text-slate-700 underline-offset-2 hover:underline disabled:opacity-40 ${FOCUS}`}>{T.clearFilters}</button>
            <button type="button" onClick={() => setPanel(false)} className={`min-h-11 rounded-xl bg-[#c2410c] px-4 text-sm font-semibold text-white hover:bg-[#9a3412] lg:hidden ${FOCUS}`}>Ver {T.results(visible.length)}</button>
          </div>
        </aside>

        <div className="min-w-0 flex-1" data-mk-grid>
          {loading && (
            <div className="columns-[15rem] gap-4" aria-hidden="true">
              {SKELETON.map((h, i) => <div key={i} className="mb-4 break-inside-avoid animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none" style={{ height: h }} />)}
            </div>
          )}
          {loading && <span className="sr-only" role="status">{T.states.loadingBody}</span>}
          {failed && <ResourceStateBlock kind="unavailable" onRetry={() => setAttempt((n) => n + 1)} />}
          {!loading && !failed && all.length === 0 && <ResourceStateBlock kind="empty" />}
          {!loading && !failed && all.length > 0 && visible.length === 0 && (
            <div data-mk-empty className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              <p>{T.noResults}</p>
              <button type="button" onClick={clear} data-mk-clear className={`mt-3 min-h-11 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 ${FOCUS}`}>{T.clearFilters}</button>
            </div>
          )}
          {visible.length > 0 && <div className="columns-[15rem] gap-4">{visible.map((r) => <ResourceTile key={r.resourceKey} resource={r} hubUrl={hubUrl} />)}</div>}
        </div>
      </div>

      <MarketplaceAbout open={about} onClose={() => setAbout(false)} />
    </section>
  );
}
