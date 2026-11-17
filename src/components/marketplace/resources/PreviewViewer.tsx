// src/components/marketplace/resources/PreviewViewer.tsx
//
// Full-screen preview viewer (web counterpart of the ERP AdvancedFileViewer, with
// no extra dependencies). Native <dialog>: focus trap, Escape and focus return
// come from the platform. Fit-to-screen without cropping, zoom (buttons, keys,
// wheel, pinch, double tap), pan, swipe between previews, page thumbnails,
// fullscreen and neighbour preloading. Only images the parser admitted reach it.
import { useCallback, useEffect, useRef, useState } from "react";
import { previewUrl } from "../../../lib/marketplace-resources/client";
import { T } from "../../../lib/marketplace-resources/text";
import type { Preview } from "../../../lib/marketplace-resources/types";
import { Icon, type IconName } from "./icons";

const G = T.gallery;
const MAX = 6;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
// Same chrome as the ERP AdvancedFileViewer: small ghost bar buttons, glass overlays.
const BAR = "flex h-9 w-9 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none";
const TOOL = "flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-30";
const GLASS = "border border-white/15 bg-white/10 backdrop-blur-xl backdrop-saturate-150 shadow-lg";

interface Props { items: Preview[]; index: number; onIndex: (i: number) => void; open: boolean; onClose: () => void; hubUrl?: string | null; failed: Record<string, boolean>; onFail: (sha: string) => void }

export default function PreviewViewer({ items, index, onIndex, open, onClose, hubUrl, failed, onFail }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const [loaded, setLoaded] = useState(false);
  const [full, setFull] = useState(false);
  const [canFull, setCanFull] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ x0: number; y0: number; t0: number; moved: boolean; pinch?: { d0: number; s0: number } }>({ x0: 0, y0: 0, t0: 0, moved: false });
  const lastTap = useRef(0);
  const current = items[Math.min(index, items.length - 1)];
  const many = items.length > 1;

  // Keep the pan inside the zoomed image (never lose it off-screen).
  const bound = useCallback((s: number, x: number, y: number) => {
    const el = img.current, box = stage.current;
    if (!el || !box || s <= 1) return { s: 1, x: 0, y: 0 };
    const mx = Math.max(0, (el.offsetWidth * s - box.clientWidth) / 2), my = Math.max(0, (el.offsetHeight * s - box.clientHeight) / 2);
    return { s, x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
  }, []);
  const zoomAt = useCallback((next: number, fx = 0, fy = 0) => {
    const { s, x, y } = viewRef.current;
    const ns = clamp(next, 1, MAX), k = ns / s;
    setView(bound(ns, fx - (fx - x) * k, fy - (fy - y) * k));
  }, [bound]);
  const reset = useCallback(() => setView({ s: 1, x: 0, y: 0 }), []);
  const go = useCallback((n: number) => { if (n >= 0 && n < items.length) onIndex(n); }, [items.length, onIndex]);
  const [thumbsOpen, setThumbsOpen] = useState(true);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => { setCanFull(typeof document !== "undefined" && !!document.fullscreenEnabled); }, []);
  useEffect(() => { reset(); setLoaded(false); }, [index, open, reset]);
  useEffect(() => { if (img.current?.complete && img.current.naturalWidth > 0) setLoaded(true); });
  useEffect(() => {
    if (!open) return;
    [index - 1, index + 1].forEach((i) => { const p = items[(i + items.length) % items.length]; if (p && p !== current && !failed[p.sha256]) new Image().src = previewUrl(hubUrl, p); });
    strip.current?.querySelector<HTMLElement>("[aria-current='true']")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [open, index, items, current, failed, hubUrl]);
  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  // Wheel zoom needs a non-passive listener so the page behind never scrolls.
  useEffect(() => {
    const box = stage.current;
    if (!open || !box) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = box.getBoundingClientRect();
      zoomAt(viewRef.current.s * Math.exp(-e.deltaY * 0.0018), e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, [open, zoomAt]);

  const toggleFull = () => { if (document.fullscreenElement) void document.exitFullscreen(); else void frame.current?.requestFullscreen().catch(() => {}); };
  const close = () => { if (document.fullscreenElement) void document.exitFullscreen(); onClose(); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const zoomed = viewRef.current.s > 1;
    const step = 80;
    switch (e.key) {
      case "ArrowRight": if (zoomed) setView((v) => bound(v.s, v.x - step, v.y)); else if (many) go(index + 1); break;
      case "ArrowLeft": if (zoomed) setView((v) => bound(v.s, v.x + step, v.y)); else if (many) go(index - 1); break;
      case "ArrowUp": if (zoomed) setView((v) => bound(v.s, v.x, v.y + step)); else return; break;
      case "ArrowDown": if (zoomed) setView((v) => bound(v.s, v.x, v.y - step)); else return; break;
      case "Home": if (many) go(0); break;
      case "End": if (many) go(items.length - 1); break;
      case "+": case "=": zoomAt(viewRef.current.s * 1.4); break;
      case "-": case "_": zoomAt(viewRef.current.s / 1.4); break;
      case "0": reset(); break;
      case "1": if (img.current) zoomAt(img.current.naturalWidth / img.current.offsetWidth || 1); break;
      case "f": case "F": if (canFull) toggleFull(); break;
      default: return;
    }
    e.preventDefault();
  };

  const rel = (e: React.PointerEvent) => { const r = stage.current!.getBoundingClientRect(); return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 }; };
  const onDown = (e: React.PointerEvent) => {
    // Capturing a pointer that starts on an overlaid button retargets its click to the stage.
    if ((e.target as HTMLElement).closest("button")) return;
    stage.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 1) Object.assign(g, { x0: e.clientX, y0: e.clientY, t0: Date.now(), moved: false, pinch: undefined });
    else if (pointers.current.size === 2) { const [a, b] = [...pointers.current.values()]; g.pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, s0: viewRef.current.s }; g.moved = true; }
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const g = gesture.current;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && g.pinch) {
      const [a, b] = [...pointers.current.values()];
      const r = stage.current!.getBoundingClientRect();
      zoomAt(g.pinch.s0 * (Math.hypot(a.x - b.x, a.y - b.y) / g.pinch.d0), (a.x + b.x) / 2 - r.left - r.width / 2, (a.y + b.y) / 2 - r.top - r.height / 2);
      return;
    }
    if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) > 6) g.moved = true;
    if (viewRef.current.s > 1) { const dx = e.clientX - prev.x, dy = e.clientY - prev.y; setView((v) => bound(v.s, v.x + dx, v.y + dy)); }
  };
  const onUp = (e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = gesture.current;
    if (pointers.current.size > 0) return;
    const dx = e.clientX - g.x0, dy = e.clientY - g.y0, dt = Date.now() - g.t0;
    if (g.pinch) { g.pinch = undefined; return; }
    if (viewRef.current.s === 1 && many && dt < 700 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { go(index + (dx < 0 ? 1 : -1)); return; }
    if (!g.moved && dt < 300) {
      const now = Date.now();
      if (now - lastTap.current < 320) { lastTap.current = 0; const p = rel(e); if (viewRef.current.s > 1) reset(); else zoomAt(2.5, p.x, p.y); }
      else lastTap.current = now;
    }
  };

  const pct = Math.round(view.s * 100);
  const canPrev = index > 0, canNext = index < items.length - 1;
  const nav = (dir: -1 | 1, icon: IconName, label: string) => (
    <button type="button" onClick={() => go(index + dir)} aria-label={label} title={label} className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/70 backdrop-blur-md transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:flex ${dir < 0 ? "left-3" : "right-3"}`}><Icon name={icon} className="h-5 w-5" /></button>
  );

  return (
    <dialog ref={dialog} aria-label={G.enlarged} onClose={onClose} onKeyDown={onKey} className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-white/15 p-0 text-white backdrop-blur-[24px] backdrop-saturate-[1.4] backdrop:bg-black/40" data-viewer>
      {open && (
        // Fullscreen has no page behind it to blur, so it falls back to a solid surface.
        <div ref={frame} className="flex h-full w-full flex-col [&:fullscreen]:bg-[#0f172a]">
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3">
            <p className="min-w-0 flex-1 truncate text-[13px] font-medium" title={current.alt}>{current.alt}</p>
            {many && (
              <div className="flex shrink-0 items-center gap-0.5">
                <button type="button" onClick={() => go(index - 1)} disabled={!canPrev} aria-label={G.previous} title={G.previous} className={BAR}><Icon name="left" className="h-4 w-4" /></button>
                <span className="min-w-11 select-none text-center text-[11px] tabular-nums text-white/60">{index + 1} / {items.length}</span>
                <button type="button" onClick={() => go(index + 1)} disabled={!canNext} aria-label={G.next} title={G.next} className={BAR}><Icon name="right" className="h-4 w-4" /></button>
              </div>
            )}
            <div className="flex shrink-0 items-center gap-0.5">
              {canFull && <button type="button" onClick={toggleFull} aria-pressed={full} aria-label={full ? G.exitFullscreen : G.fullscreen} title={full ? G.exitFullscreen : G.fullscreen} className={BAR}><Icon name={full ? "shrink" : "expand"} className="h-3.5 w-3.5" /></button>}
              <div className="mx-1 h-3.5 w-px bg-white/15" />
              <button type="button" onClick={close} aria-label={G.close} title={G.close} className={BAR} autoFocus><Icon name="x" className="h-4 w-4" /></button>
            </div>
          </div>

          <div ref={stage} className="relative min-h-0 flex-1 touch-none select-none overflow-hidden" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} data-viewer-stage>
            <div className="flex h-full w-full items-center justify-center p-2 sm:p-6">
              {failed[current.sha256] ? (
                <div className="flex flex-col items-center gap-2 text-sm text-[#aab4cc]" role="img" aria-label={G.failed(current.alt)}><Icon name="imageOff" className="h-10 w-10" />{G.failedShort}</div>
              ) : (
                <img
                  key={current.sha256}
                  ref={img}
                  src={previewUrl(hubUrl, current)}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  decoding="async"
                  draggable={false}
                  onLoad={() => setLoaded(true)}
                  onError={() => onFail(current.sha256)}
                  style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`, cursor: view.s > 1 ? "grab" : "zoom-in" }}
                  className={`block h-auto max-h-full w-auto max-w-full object-contain ${loaded ? "opacity-100" : "opacity-0"}`}
                />
              )}
            </div>
            {!loaded && !failed[current.sha256] && <div className="pointer-events-none absolute inset-0 flex items-center justify-center" role="status" aria-label={G.loading}><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#ffffff40] border-t-orange-400 motion-reduce:animate-none" /></div>}
            {many && canPrev && nav(-1, "left", G.previous)}
            {many && canNext && nav(1, "right", G.next)}
            {many && (thumbsOpen ? (
              <div className={`absolute bottom-3 left-1/2 z-20 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-1.5 p-1.5 ${GLASS} rounded-2xl`}>
                <div ref={strip} role="group" aria-label={G.thumbsLabel} className="flex items-center gap-2 overflow-x-auto p-0.5">
                  {items.map((p, i) => (
                    <button key={p.sha256} type="button" onClick={() => onIndex(i)} aria-current={i === index} aria-label={G.show(i + 1, p.alt)} className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${i === index ? "ring-2 ring-orange-400" : "opacity-50 hover:opacity-90"}`}>
                      {failed[p.sha256] ? <span className="flex h-full items-center justify-center text-white/50"><Icon name="imageOff" className="h-5 w-5" /></span> : <img src={previewUrl(hubUrl, p)} alt="" loading="lazy" decoding="async" draggable={false} onError={() => onFail(p.sha256)} className="h-full w-full object-cover" />}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setThumbsOpen(false)} aria-label={G.hideThumbs} title={G.hideThumbs} className={`${BAR} h-8 w-8`}><Icon name="down" className="h-4 w-4" /></button>
              </div>
            ) : (
              <button type="button" onClick={() => setThumbsOpen(true)} aria-label={G.showThumbs} title={G.showThumbs} className={`absolute bottom-3 left-1/2 z-20 flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full px-3 text-[11px] text-white/70 hover:text-white ${GLASS}`}>
                <Icon name="up" className="h-3.5 w-3.5" />{index + 1} / {items.length}
              </button>
            ))}
          </div>

          <div className="flex h-12 shrink-0 items-center justify-center gap-1.5 border-t border-white/10 bg-white/[0.04] px-3">
            <div className="flex items-center rounded-lg bg-white/[0.06] p-0.5">
              <button type="button" onClick={() => zoomAt(viewRef.current.s / 1.4)} disabled={view.s <= 1} aria-label={G.zoomOut} title={G.zoomOut} className={TOOL}><Icon name="minus" className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={reset} aria-label={G.resetZoom} title={G.resetZoom} className="h-7 min-w-13 px-2 text-[11px] tabular-nums text-white/60 transition-colors hover:text-white">{G.zoomLevel(pct)}</button>
              <button type="button" onClick={() => zoomAt(viewRef.current.s * 1.4)} disabled={view.s >= MAX} aria-label={G.zoomIn} title={G.zoomIn} className={TOOL}><Icon name="plus" className="h-3.5 w-3.5" /></button>
            </div>
            <div className="mx-0.5 h-4 w-px bg-white/15" />
            <button type="button" onClick={reset} aria-label={G.fit} title={G.fit} className={TOOL}><Icon name="fit" className="h-3.5 w-3.5" /></button>
          </div>
          <p className="sr-only" aria-live="polite">{G.keysHint}</p>
        </div>
      )}
    </dialog>
  );
}
