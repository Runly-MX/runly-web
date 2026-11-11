// src/components/marketplace/resources/CollectionShelves.tsx
//
// Seasonal and thematic shelves above the full catalog ("Ahora en temporada",
// "Para restaurantes"...). Each shelf is a horizontal scroller of regular tiles
// with prev/next buttons, a staggered entrance and a reveal on scroll.
import { useRef } from "react";
import type { Shelf } from "../../../lib/marketplace-resources/collections";
import { Icon } from "./icons";
import { FOCUS } from "./parts";
import ResourceTile from "./ResourceTile";
import { useReveal } from "./useReveal";

const arrow = `hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-[transform,background-color] duration-200 hover:bg-slate-50 active:scale-90 sm:flex motion-reduce:transition-none ${FOCUS}`;

function ShelfRow({ shelf, hubUrl, first }: { shelf: Shelf; hubUrl?: string; first: boolean }) {
  const { collection, seasonal, items } = shelf;
  const scroller = useRef<HTMLUListElement>(null);
  const move = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  return (
    <section aria-labelledby={`mk-shelf-${collection.id}`} className="mk-reveal">
      <header className={`relative mb-4 flex items-end justify-between gap-3 overflow-hidden rounded-2xl ${seasonal ? "mk-sheen bg-gradient-to-r from-orange-50 via-amber-50 to-white p-4 ring-1 ring-inset ring-orange-100 sm:p-5" : ""}`}>
        <div className="relative min-w-0">
          {seasonal && (
            <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#c2410c]"><Icon name="sparkles" className="h-3.5 w-3.5 motion-safe:animate-pulse" />{first ? "Ahora en temporada" : "De temporada"}</p>
          )}
          <h2 id={`mk-shelf-${collection.id}`} className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{collection.title}</h2>
          <p className="mt-0.5 text-sm text-slate-600">{collection.blurb}</p>
        </div>
        <div className="relative flex shrink-0 gap-2">
          <button type="button" onClick={() => move(-1)} aria-label={`Anteriores: ${collection.title}`} className={arrow}><Icon name="left" className="h-4 w-4" /></button>
          <button type="button" onClick={() => move(1)} aria-label={`Siguientes: ${collection.title}`} className={arrow}><Icon name="right" className="h-4 w-4" /></button>
        </div>
      </header>
      <ul ref={scroller} className="-mx-4 flex snap-x gap-4 overflow-x-auto scroll-smooth px-4 pb-3 pt-1 sm:mx-0 sm:px-1 [scrollbar-width:thin]">
        {items.map((r, i) => (
          <li key={r.resourceKey} style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }} className="mk-rise w-56 shrink-0 snap-start sm:w-60 [&_article]:mb-0">
            <ResourceTile resource={r} hubUrl={hubUrl} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function CollectionShelves({ shelves, hubUrl }: { shelves: Shelf[]; hubUrl?: string }) {
  const ref = useReveal<HTMLDivElement>(shelves.length);
  if (shelves.length === 0) return null;
  return (
    <div ref={ref} className="mb-10 space-y-9" data-mk-shelves>
      {shelves.map((s, i) => <ShelfRow key={s.collection.id} shelf={s} hubUrl={hubUrl} first={i === 0} />)}
    </div>
  );
}
