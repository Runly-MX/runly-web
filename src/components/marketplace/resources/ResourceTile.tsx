// src/components/marketplace/resources/ResourceTile.tsx
//
// One gallery tile: the preview is the protagonist and keeps its REAL format
// (width/height from the published preview), so portrait labels and wide banners
// sit together as in an editorial gallery. Text is minimal: title, publisher and
// a discreet provenance mark. The whole tile is one link.
import { useState } from "react";
import { previewUrl } from "../../../lib/marketplace-resources/client";
import { resourcePath } from "../../../lib/marketplace-resources/routes";
import { T, TYPE_TEXT } from "../../../lib/marketplace-resources/text";
import type { ResourceSummary } from "../../../lib/marketplace-resources/types";
import { Icon, TYPE_ICON } from "./icons";
import { AvailabilityChip, Avatar, TrustBadge, TYPE_COVER } from "./parts";

// Extreme formats are boxed so one tile never dominates a column.
const ratio = (w: number, h: number) => Math.min(2, Math.max(0.55, w / h));

export default function ResourceTile({ resource: r, hubUrl }: { resource: ResourceSummary; hubUrl?: string | null }) {
  const [broken, setBroken] = useState(false);
  const preview = r.previews[0] && !broken ? r.previews[0] : null;
  const unavailable = r.availability !== "available";
  return (
    <article className={`mk-card group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-glass focus-within:ring-2 focus-within:ring-orange-500 motion-reduce:transition-none ${unavailable ? "opacity-80" : ""}`} data-type={r.type} data-trust={r.trust} data-availability={r.availability}>
      <div className={`relative overflow-hidden ${preview ? "bg-slate-100" : `bg-gradient-to-br ${TYPE_COVER[r.type]}`}`} style={{ aspectRatio: preview ? ratio(preview.width, preview.height) : 4 / 3 }} data-mk-preview>
        {preview
          ? <img src={previewUrl(hubUrl, preview)} alt={preview.alt} width={preview.width} height={preview.height} loading="lazy" decoding="async" onError={() => setBroken(true)} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
          : <span data-mk-preview-fallback className="absolute inset-0 flex items-center justify-center"><Icon name={TYPE_ICON[r.type]} className="h-10 w-10 opacity-80" /></span>}
        <span className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {r.trust !== "community" && <span className="rounded-full bg-white/95 shadow-sm"><TrustBadge trust={r.trust} compact /></span>}
          {unavailable && r.trust !== "revoked" && <span className="rounded-full bg-white/95 shadow-sm"><AvailabilityChip availability={r.availability} /></span>}
        </span>
      </div>
      <div className="flex items-center gap-2.5 p-3">
        <Avatar name={r.publisher.displayName} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold leading-tight text-slate-900">
            <a href={resourcePath(r.type, r.slug)} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">{r.title}</a>
          </h3>
          <p className="truncate text-xs text-slate-500">{r.publisher.displayName}{r.latest ? ` · ${T.version(r.latest.version)}` : ""}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-slate-500" title={TYPE_TEXT[r.type].singular}><Icon name={TYPE_ICON[r.type]} className="h-3.5 w-3.5" /><span className="hidden min-[420px]:inline">{TYPE_TEXT[r.type].short}</span></span>
      </div>
    </article>
  );
}
