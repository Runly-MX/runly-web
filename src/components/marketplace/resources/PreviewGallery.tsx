// src/components/marketplace/resources/PreviewGallery.tsx
//
// Up to six previews of a resource, exactly as the parser admitted them (only
// raster images on the Hub preview route). A large stage that respects each
// image's real format, selectable page thumbnails (arrow keys, Home/End) and the
// full viewer (PreviewViewer). No iframes, no Studio rendering. A preview that
// fails to load says so instead of breaking.
import { useEffect, useRef, useState } from "react";
import { previewUrl } from "../../../lib/marketplace-resources/client";
import { T } from "../../../lib/marketplace-resources/text";
import type { Preview } from "../../../lib/marketplace-resources/types";
import { Icon } from "./icons";
import { FOCUS } from "./parts";
import PreviewViewer from "./PreviewViewer";

const G = T.gallery;

function Failed({ preview, className, compact = false }: { preview: Preview; className: string; compact?: boolean }) {
  return (
    <div className={`${className} flex flex-col items-center justify-center gap-1 bg-slate-100 p-3 text-center text-xs text-slate-500`} role="img" aria-label={G.failed(preview.alt)} data-preview-failed>
      <Icon name="imageOff" className="h-6 w-6" />
      {!compact && <span>{G.failedShort}</span>}
    </div>
  );
}

export default function PreviewGallery({ previews, hubUrl }: { previews: Preview[]; hubUrl?: string | null }) {
  const items = previews.slice(0, 6);
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { if (index >= items.length) setIndex(0); }, [items.length, index]);
  if (items.length === 0) return null;
  const current = items[Math.min(index, items.length - 1)];
  const fail = (sha: string) => setFailed((f) => ({ ...f, [sha]: true }));
  const many = items.length > 1;
  const go = (next: number, focus = false) => {
    const n = (next + items.length) % items.length;
    setIndex(n);
    if (focus) thumbs.current[n]?.focus();
  };
  const onThumbKey = (event: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 };
    if (event.key in keys) { event.preventDefault(); go(keys[event.key], true); }
  };
  const bad = !!failed[current.sha256];

  return (
    <section aria-label={G.label} data-gallery data-count={items.length}>
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
        <button type="button" onClick={() => setViewer(true)} disabled={bad} aria-label={G.enlarge(current.alt)} className={`group flex min-h-[16rem] w-full cursor-zoom-in items-center justify-center p-4 sm:p-8 ${FOCUS} focus-visible:ring-inset`}>
          {bad
            ? <Failed preview={current} className="aspect-[4/3] w-full rounded-2xl" />
            : <img key={current.sha256} src={previewUrl(hubUrl, current)} alt={current.alt} width={current.width} height={current.height} sizes="(min-width: 1024px) 60vw, 100vw" loading="eager" decoding="async" onError={() => fail(current.sha256)} className="h-auto max-h-[72dvh] w-auto max-w-full rounded-lg object-contain shadow-[0_20px_50px_-20px_rgba(11,19,43,0.45)] transition-transform duration-300 motion-reduce:transition-none sm:group-hover:scale-[1.01]" />}
          {!bad && <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#0b132bd9] px-3 py-1.5 text-xs font-semibold text-white"><Icon name="expand" className="h-3.5 w-3.5" />{G.enlargeHint}</span>}
        </button>
        {many && (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label={G.previous} className={`absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow hover:bg-white sm:flex ${FOCUS}`}><Icon name="left" className="h-5 w-5" /></button>
            <button type="button" onClick={() => go(index + 1)} aria-label={G.next} className={`absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow hover:bg-white sm:flex ${FOCUS}`}><Icon name="right" className="h-5 w-5" /></button>
          </>
        )}
      </div>
      <p className="mt-2 px-1 text-sm text-slate-600" data-gallery-caption>
        {current.alt}{many && <span className="text-slate-500"> · {G.position(index + 1, items.length)}</span>}
      </p>

      {many && (
        <div role="group" aria-label={G.thumbnails} className="mt-3 flex gap-2 overflow-x-auto pb-1" onKeyDown={onThumbKey}>
          {items.map((p, i) => (
            <button
              key={p.sha256}
              ref={(el) => { thumbs.current[i] = el; }}
              type="button"
              onClick={() => setIndex(i)}
              tabIndex={i === index ? 0 : -1}
              aria-pressed={i === index}
              aria-label={G.show(i + 1, p.alt)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100 transition-colors motion-reduce:transition-none sm:h-[4.5rem] sm:w-24 ${FOCUS} ${i === index ? "border-orange-500" : "border-transparent opacity-80 hover:border-slate-300 hover:opacity-100"}`}
            >
              {failed[p.sha256]
                ? <Failed preview={p} className="h-full w-full" compact />
                : <img src={previewUrl(hubUrl, p)} alt="" loading="lazy" decoding="async" onError={() => fail(p.sha256)} className="h-full w-full object-contain" />}
            </button>
          ))}
        </div>
      )}

      <PreviewViewer items={items} index={index} onIndex={setIndex} open={viewer} onClose={() => setViewer(false)} hubUrl={hubUrl} failed={failed} onFail={fail} />
    </section>
  );
}
