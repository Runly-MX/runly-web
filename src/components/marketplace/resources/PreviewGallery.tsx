// src/components/marketplace/resources/PreviewGallery.tsx
//
// Up to six previews of a resource, exactly as the parser admitted them (only
// raster images on the Hub preview route). Main image + selectable thumbnails
// (arrow keys, Home/End) + an enlarged view on the native <dialog> (Escape and
// the backdrop close it; arrows browse). No iframes, no Studio rendering, no
// dependencies. A preview that fails to load says so instead of breaking.
import { useEffect, useRef, useState } from "react";
import { previewUrl } from "../../../lib/marketplace-resources/client";
import { T } from "../../../lib/marketplace-resources/text";
import type { Preview } from "../../../lib/marketplace-resources/types";

const G = T.gallery;

function Shot({ preview, hubUrl, failed, onFail, className, sizes, eager = false, compact = false }: { preview: Preview; hubUrl?: string | null; failed: boolean; onFail: () => void; className: string; sizes?: string; eager?: boolean; compact?: boolean }) {
  if (failed) {
    return (
      <div className={`${className} flex flex-col items-center justify-center gap-1 bg-slate-100 p-3 text-center text-xs text-slate-500`} role="img" aria-label={G.failed(preview.alt)} data-preview-failed>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m3 16 5-5 4 4 3-3 6 6" /><path d="M4 4l16 16" /></svg>
        {!compact && <span>{G.failedShort}</span>}
      </div>
    );
  }
  return <img src={previewUrl(hubUrl, preview)} alt={preview.alt} width={preview.width} height={preview.height} sizes={sizes} loading={eager ? "eager" : "lazy"} decoding="async" onError={onFail} className={className} />;
}

export default function PreviewGallery({ previews, hubUrl }: { previews: Preview[]; hubUrl?: string | null }) {
  const items = previews.slice(0, 6);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { if (index >= items.length) setIndex(0); }, [items.length, index]);
  if (items.length === 0) return null;
  const current = items[Math.min(index, items.length - 1)];
  const fail = (sha: string) => () => setFailed((f) => ({ ...f, [sha]: true }));
  const go = (next: number, focus = false) => {
    const n = (next + items.length) % items.length;
    setIndex(n);
    if (focus) thumbs.current[n]?.focus();
  };
  const onThumbKey = (event: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 };
    if (event.key in keys) { event.preventDefault(); go(keys[event.key], true); }
  };
  const open = () => { if (!failed[current.sha256]) dialog.current?.showModal(); };

  return (
    <section className="mt-8" aria-label={G.label} data-gallery data-count={items.length}>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
        <button type="button" onClick={open} className="group relative block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2" aria-label={G.enlarge(current.alt)} disabled={!!failed[current.sha256]}>
          <Shot key={current.sha256} preview={current} hubUrl={hubUrl} failed={!!failed[current.sha256]} onFail={fail(current.sha256)} className="mx-auto aspect-[4/3] w-full object-contain" sizes="(min-width: 1024px) 66vw, 100vw" eager />
          {!failed[current.sha256] && (
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-slate-900/75 px-3 py-1.5 text-xs font-semibold text-white opacity-90 transition-opacity motion-reduce:transition-none group-hover:opacity-100">{G.enlargeHint}</span>
          )}
        </button>
        <p className="border-t border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600" data-gallery-caption>
          {current.alt}{items.length > 1 && <span className="text-slate-400"> · {G.position(index + 1, items.length)}</span>}
        </p>
      </div>

      {items.length > 1 && (
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
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:h-[72px] sm:w-24 ${i === index ? "border-orange-500" : "border-transparent hover:border-slate-300"}`}
            >
              <Shot preview={p} hubUrl={hubUrl} failed={!!failed[p.sha256]} onFail={fail(p.sha256)} className="h-full w-full object-cover" compact />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialog}
        aria-label={G.enlarged}
        onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}
        onKeyDown={(e) => { if (items.length > 1 && e.key === "ArrowRight") go(index + 1); if (items.length > 1 && e.key === "ArrowLeft") go(index - 1); }}
        className="m-auto max-h-[92dvh] w-[min(96vw,1200px)] rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/80"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
          <p className="min-w-0 truncate text-sm font-semibold text-slate-800">{current.alt}</p>
          <button type="button" onClick={() => dialog.current?.close()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" aria-label={G.close}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="relative bg-slate-50">
          <Shot key={current.sha256} preview={current} hubUrl={hubUrl} failed={!!failed[current.sha256]} onFail={fail(current.sha256)} className="mx-auto max-h-[78dvh] w-full object-contain" />
          {items.length > 1 && (
            <>
              <button type="button" onClick={() => go(index - 1)} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" aria-label={G.previous}>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 6-6 6 6 6" /></svg>
              </button>
              <button type="button" onClick={() => go(index + 1)} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" aria-label={G.next}>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 6 6 6-6 6" /></svg>
              </button>
            </>
          )}
        </div>
        {items.length > 1 && <p className="px-4 py-2 text-center text-xs text-slate-500" aria-live="polite">{G.position(index + 1, items.length)}</p>}
      </dialog>
    </section>
  );
}
