// src/components/marketplace/resources/parts.tsx
//
// Small presentational pieces shared by the React detail view and the runtime
// loader. The Astro list components use their own markup with the same classes.
import type { ReactNode } from "react";
import type { TrustLevel } from "../../../lib/marketplace";
import { TYPE_TEXT, T } from "../../../lib/marketplace-resources/text";
import type { Availability, ResourceType } from "../../../lib/marketplace-resources/types";

export const TYPE_STYLE: Record<ResourceType, { bg: string; text: string; ring: string }> = {
  studio_template: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200" },
  automation: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  website_template: { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200" },
  solution: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
};

export const TYPE_COVER: Record<ResourceType, string> = {
  studio_template: "from-violet-100 to-violet-50 text-violet-700",
  automation: "from-amber-100 to-amber-50 text-amber-700",
  website_template: "from-sky-100 to-sky-50 text-sky-700",
  solution: "from-emerald-100 to-emerald-50 text-emerald-700",
};

const TRUST_STYLE: Record<TrustLevel, string> = {
  official: "bg-sky-50 text-sky-700 ring-sky-200",
  "community-verified": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  community: "bg-slate-100 text-slate-600 ring-slate-200",
  revoked: "bg-red-50 text-red-700 ring-red-200",
};

export function TrustBadge({ trust }: { trust: TrustLevel }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${TRUST_STYLE[trust]}`} title={T.trustHint[trust]} data-trust={trust}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {T.trust[trust]}
    </span>
  );
}

export function TypeChip({ type }: { type: ResourceType }) {
  const s = TYPE_STYLE[type];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${s.bg} ${s.text} ${s.ring}`}>{TYPE_TEXT[type].singular}</span>;
}

export function AvailabilityChip({ availability, trust }: { availability: Availability; trust?: string }) {
  // A revoked trust badge already says "Revocado": no duplicate chip.
  if (availability === "available" || (availability === "revoked" && trust === "revoked")) return null;
  const tone = availability === "revoked" ? "bg-red-50 text-red-700 ring-red-200" : "bg-amber-50 text-amber-800 ring-amber-200";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tone}`} data-availability={availability}>{T.availability[availability]}</span>;
}

export function Panel({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm text-slate-600">{children}</div>
    </section>
  );
}
