// src/lib/marketplace-resources/collections.ts
//
// Curated shelves for the catalog home. Seasonal collections appear only inside
// their date window (with a lead time so people can prepare); evergreen ones
// group by theme. A resource joins a collection when one of its categories is a
// collection id/keyword or a keyword appears in its title or summary, so nothing
// has to be re-published to show up: tag it (e.g. "dia-de-las-madres") or just
// name it well. A shelf with no matching resource is never shown.
import { searchKey } from "./filters";
import type { ResourceSummary } from "./types";

export interface Collection {
  id: string;
  title: string;
  blurb: string;
  /** Seasonal window as [month, day] pairs, inclusive; may wrap the year end. Omitted = evergreen. */
  window?: { from: [number, number]; to: [number, number] };
  keywords: string[];
}

export const COLLECTIONS: Collection[] = [
  { id: "san-valentin", title: "San Valentín", blurb: "Promociones, menús y diseños para el 14 de febrero.", window: { from: [1, 25], to: [2, 14] }, keywords: ["valentin", "amor", "enamorados"] },
  { id: "dia-del-nino", title: "Día del Niño", blurb: "Para celebrar y vender en el Día del Niño.", window: { from: [4, 15], to: [4, 30] }, keywords: ["dia del nino", "ninos", "infantil"] },
  { id: "dia-de-las-madres", title: "Día de las Madres", blurb: "Todo para el 10 de mayo: ofertas, menús y campañas.", window: { from: [4, 25], to: [5, 10] }, keywords: ["madres", "mama", "dia de las madres"] },
  { id: "dia-del-padre", title: "Día del Padre", blurb: "Ideas y diseños para el Día del Padre.", window: { from: [6, 1], to: [6, 21] }, keywords: ["padre", "papa", "dia del padre"] },
  { id: "verano", title: "Verano", blurb: "Vacaciones, temporada alta y promociones de calor.", window: { from: [6, 15], to: [8, 31] }, keywords: ["verano", "vacaciones", "playa", "helado", "temporada alta"] },
  { id: "regreso-a-clases", title: "Regreso a clases", blurb: "Papelería, uniformes y campañas de vuelta a la escuela.", window: { from: [8, 1], to: [9, 10] }, keywords: ["regreso a clases", "escolar", "escuela", "papeleria", "uniformes"] },
  { id: "fiestas-patrias", title: "Fiestas patrias", blurb: "Menús, ofertas y decoración para septiembre.", window: { from: [9, 1], to: [9, 20] }, keywords: ["patrias", "independencia", "mexicano", "16 de septiembre"] },
  { id: "dia-de-muertos", title: "Día de Muertos", blurb: "Altares, menús de temporada y campañas para el 2 de noviembre.", window: { from: [10, 10], to: [11, 2] }, keywords: ["muertos", "catrina", "altar", "halloween"] },
  { id: "buen-fin", title: "Buen Fin y Black Friday", blurb: "Ofertas, carteles y automatizaciones para el fin de semana de descuentos.", window: { from: [11, 1], to: [11, 30] }, keywords: ["buen fin", "black friday", "oferta", "descuento", "promocion"] },
  { id: "navidad", title: "Navidad", blurb: "Posadas, cenas, regalos y campañas decembrinas.", window: { from: [11, 20], to: [12, 26] }, keywords: ["navidad", "navideno", "posada", "regalos", "decembrin"] },
  { id: "fin-de-ano", title: "Fin de año", blurb: "Cierres contables, resúmenes anuales y planes del año nuevo.", window: { from: [12, 15], to: [1, 10] }, keywords: ["fin de ano", "ano nuevo", "cierre anual", "balance"] },
  { id: "restaurantes", title: "Para restaurantes y cafeterías", blurb: "Menús, reservaciones, comandas y sitios para comida.", keywords: ["restaurante", "cafeteria", "menu", "comida", "cocina"] },
  { id: "ventas", title: "Para vender más", blurb: "Seguimiento de clientes, cotizaciones y promociones.", keywords: ["ventas", "lead", "cotizacion", "clientes", "promociones"] },
  { id: "finanzas", title: "Finanzas y cobranza", blurb: "Recordatorios de cobro, cierres y control del dinero.", keywords: ["finanzas", "cobro", "cobranza", "factura", "contabilidad"] },
];

const key = (m: number, d: number) => m * 100 + d;

/** True when `date` is inside the (possibly year-wrapping) window. */
export function inWindow(date: Date, w: NonNullable<Collection["window"]>) {
  const now = key(date.getMonth() + 1, date.getDate());
  const from = key(...w.from);
  const to = key(...w.to);
  return from <= to ? now >= from && now <= to : now >= from || now <= to;
}

export interface Shelf { collection: Collection; seasonal: boolean; items: ResourceSummary[] }

const MIN_EVERGREEN = 3;

/** Shelves to show today: seasonal ones in window first, then evergreen themes with enough resources. */
export function activeShelves(items: ResourceSummary[], now: Date = new Date()): Shelf[] {
  const available = items.filter((r) => r.availability === "available");
  const keyed = available.map((r) => ({ r, text: searchKey(r) }));
  const shelves: Shelf[] = [];
  for (const collection of COLLECTIONS) {
    const seasonal = !!collection.window;
    if (collection.window && !inWindow(now, collection.window)) continue;
    const found = keyed
      .filter(({ r, text }) => r.categories.includes(collection.id) || collection.keywords.some((k) => text.includes(k)))
      .map(({ r }) => r);
    if (found.length === 0 || (!seasonal && found.length < MIN_EVERGREEN)) continue;
    shelves.push({ collection, seasonal, items: found.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 12) });
  }
  return shelves.sort((a, b) => Number(b.seasonal) - Number(a.seasonal));
}
