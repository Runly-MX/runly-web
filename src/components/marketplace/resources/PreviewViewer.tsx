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
const BTN = "flex h-11 min-w-11 items-center justify-center rounded-full bg-[#ffffff1a] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#ffffff33] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-40 motion-reduce:transition-none";

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
  const go = useCallback((n: number) => { onIndex((n + items.length) % items.length); }, [items.length, onIndex]);

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
  const nav = (dir: -1 | 1, icon: IconName, label: string) => (
    <button type="button" onClick={() => go(index + dir)} aria-label={label} className={`absolute top-1/2 hidden -translate-y-1/2 sm:flex ${dir < 0 ? "left-3" : "right-3"} ${BTN} h-12 w-12 bg-[#0b132bcc]`}><Icon name={icon} className="h-5 w-5" /></button>
  );

  return (
    <dialog ref={dialog} aria-label={G.enlarged} onClose={onClose} onKeyDown={onKey} className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-[#05080f] p-0 text-white backdrop:bg-black" data-viewer>
      {open && (
        <div ref={frame} className="flex h-full w-full flex-col bg-[#05080f]">
          <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold" title={current.alt}>{current.alt}{many && <span className="font-normal text-[#aab4cc]"> · {G.position(index + 1, items.length)}</span>}</p>
            <button type="button" onClick={() => zoomAt(viewRef.current.s / 1.4)} disabled={view.s <= 1} aria-label={G.zoomOut} className={BTN}><Icon name="zoomOut" className="h-5 w-5" /></button>
            <button type="button" onClick={reset} aria-label={G.fit} title={G.fit} className={`${BTN} hidden w-16 tabular-nums sm:flex`}>{view.s === 1 ? G.fitShort : G.zoomLevel(pct)}</button>
            <button type="button" onClick={() => zoomAt(viewRef.current.s * 1.4)} disabled={view.s >= MAX} aria-label={G.zoomIn} className={BTN}><Icon name="zoomIn" className="h-5 w-5" /></button>
            <button type="button" onClick={reset} aria-label={G.fit} title={G.fit} className={`${BTN} sm:hidden`}><Icon name="fit" className="h-5 w-5" /></button>
            {canFull && <button type="button" onClick={toggleFull} aria-pressed={full} aria-label={full ? G.exitFullscreen : G.fullscreen} title={full ? G.exitFullscreen : G.fullscreen} className={BTN}><Icon name={full ? "shrink" : "expand"} className="h-5 w-5" /></button>}
            <button type="button" onClick={close} aria-label={G.close} className={BTN} autoFocus><Icon name="x" className="h-5 w-5" /></button>
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
            {many && <>{nav(-1, "left", G.previous)}{nav(1, "right", G.next)}</>}
          </div>

          {many && (
            <div ref={strip} role="group" aria-label={G.thumbsLabel} className="flex gap-2 overflow-x-auto px-3 py-3 sm:justify-center">
              {items.map((p, i) => (
                <button key={p.sha256} type="button" onClick={() => onIndex(i)} aria-current={i === index} aria-label={G.show(i + 1, p.alt)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-[#ffffff14] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:h-16 sm:w-24 ${i === index ? "border-orange-400" : "border-transparent opacity-70 hover:opacity-100"}`}>
                  {failed[p.sha256] ? <span className="flex h-full items-center justify-center text-[#aab4cc]"><Icon name="imageOff" className="h-5 w-5" /></span> : <img src={previewUrl(hubUrl, p)} alt="" loading="lazy" decoding="async" onError={() => onFail(p.sha256)} className="h-full w-full object-contain" />}
                </button>
              ))}
            </div>
          )}
          <p className="sr-only" aria-live="polite">{G.keysHint}</p>
        </div>
      )}
    </dialog>
  );
}
