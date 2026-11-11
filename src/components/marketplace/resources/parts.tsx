// src/components/marketplace/resources/parts.tsx
//
// Presentational pieces shared by every Marketplace island (gallery, tiles,
// detail, publisher profile). One visual language: slate neutrals (re-mapped by
// theme.css in dark), Runly orange as the only accent, rounded-2xl surfaces.
import { useEffect, useState, type ReactNode } from "react";
import type { TrustLevel } from "../../../lib/marketplace";
import { TYPE_TEXT, T } from "../../../lib/marketplace-resources/text";
import type { Availability, ResourceType } from "../../../lib/marketplace-resources/types";
import { Icon } from "./icons";

export const TYPE_COVER: Record<ResourceType, string> = {
  studio_template: "from-violet-100 to-violet-50 text-violet-700",
  automation: "from-amber-100 to-amber-50 text-amber-700",
  website_template: "from-sky-100 to-sky-50 text-sky-700",
  solution: "from-emerald-100 to-emerald-50 text-emerald-700",
};

export const FOCUS = "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const TRUST_STYLE: Record<TrustLevel, string> = {
  official: "bg-orange-50 text-orange-700 ring-orange-200",
  "community-verified": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  community: "bg-slate-100 text-slate-600 ring-slate-200",
  revoked: "bg-red-50 text-red-700 ring-red-200",
};

/** Institutional origin (what Runly attests), never the individual author. */
export function TrustBadge({ trust, compact = false }: { trust: TrustLevel; compact?: boolean }) {
  const icon = trust === "official" ? "shield" : trust === "community-verified" ? "check" : trust === "revoked" ? "x" : "users";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset ${compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"} ${TRUST_STYLE[trust]}`} title={T.trustHint[trust]} data-trust={trust}>
      <Icon name={icon} className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {T.trust[trust]}
    </span>
  );
}

export function TypeChip({ type }: { type: ResourceType }) {
  return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{TYPE_TEXT[type].singular}</span>;
}

export function AvailabilityChip({ availability, trust }: { availability: Availability; trust?: string }) {
  // A revoked trust badge already says "Revocado": no duplicate chip.
  if (availability === "available" || (availability === "revoked" && trust === "revoked")) return null;
  const tone = availability === "revoked" ? "bg-red-50 text-red-700 ring-red-200" : "bg-amber-50 text-amber-800 ring-amber-200";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`} data-availability={availability}>{T.availability[availability]}</span>;
}

export const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const box = { sm: "h-6 w-6 text-[10px]", md: "h-10 w-10 text-sm", lg: "h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl" }[size];
  return <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 font-bold text-white ${box}`} aria-hidden="true">{initials(name)}</span>;
}

/** Chip-style toggle used by the filter panel and the type tabs (aria-pressed, 44px-friendly). */
export function ToggleChip({ on, onClick, children, count }: { on: boolean; onClick: () => void; children: ReactNode; count?: number }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={`inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-semibold transition-colors motion-reduce:transition-none ${FOCUS} ${on ? "border-[#c2410c] bg-[#c2410c] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}>
      {children}
      {count !== undefined && <span className={`text-xs font-medium ${on ? "text-[#ffffffcc]" : "text-slate-500"}`}>{count}</span>}
    </button>
  );
}

/** Section card. `collapsible` sections start closed on phones and open from lg up. */
export function Panel({ title, children, id, collapsible = false }: { title: string; children: ReactNode; id?: string; collapsible?: boolean }) {
  const [open, setOpen] = useState(!collapsible);
  useEffect(() => { if (collapsible && window.matchMedia("(min-width: 1024px)").matches) setOpen(true); }, [collapsible]);
  const body = <div className="space-y-3 text-sm text-slate-600">{children}</div>;
  if (!collapsible) {
    return (
      <section id={id} className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <div className="mt-3">{body}</div>
      </section>
    );
  }
  return (
    <section id={id} className="rounded-3xl border border-slate-200 bg-white">
      <h2>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-3xl px-5 text-left text-lg font-bold text-slate-900 sm:px-6 ${FOCUS}`}>
          {title}
          <Icon name="down" className={`h-5 w-5 text-slate-500 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
        </button>
      </h2>
      {open && <div className="px-5 pb-5 sm:px-6 sm:pb-6">{body}</div>}
    </section>
  );
}
