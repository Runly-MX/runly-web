// src/components/marketplace/resources/MarketplaceAbout.tsx
//
// "Acerca del Marketplace": the explanatory copy lives in a secondary side
// panel so the catalog starts with the resources, not with text. Native <dialog>
// (focus trap, Escape and focus return from the platform).
import { useEffect, useRef } from "react";
import { T } from "../../../lib/marketplace-resources/text";
import { Icon } from "./icons";
import { FOCUS } from "./parts";

const STEPS = [
  ["Descubre", "Explora los recursos y revisa quién los publica y con qué nivel de confianza."],
  ["Usa desde Runly", "Descarga las plantillas Studio o importa una copia desde el Marketplace integrado en tu instancia."],
  ["Revisa y activa", "Antes de aplicarse ves lo que va a hacer. Las automatizaciones se importan en pausa."],
] as const;
const LINKS = [["Módulos oficiales de Runly", "/modulos"], ["Documentación", "/documentacion/modulos"], ["Publicar en Runly", "/runly-developer"]] as const;

export default function MarketplaceAbout({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={dialog} aria-labelledby="mk-about-title" onClose={onClose} onClick={(e) => { if (e.target === dialog.current) onClose(); }} className="fixed inset-y-0 right-0 left-auto m-0 ml-auto h-dvh max-h-none w-[min(26rem,100vw)] max-w-none border-l border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <h2 id="mk-about-title" className="text-lg font-extrabold">Acerca del Marketplace</h2>
          <button type="button" onClick={onClose} aria-label={T.gallery.close} className={`flex h-11 w-11 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 ${FOCUS}`}><Icon name="x" className="h-5 w-5" /></button>
        </div>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 text-sm text-slate-600">
          <p>{T.description}</p>
          <ol className="space-y-3">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#c2410c] text-xs font-bold text-white" aria-hidden="true">{i + 1}</span>
                <span><span className="block font-bold text-slate-900">{title}</span>{body}</span>
              </li>
            ))}
          </ol>
          <ul className="space-y-1.5">
            {LINKS.map(([label, href]) => <li key={href}><a href={href} className={`flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 font-semibold text-slate-800 hover:bg-slate-50 ${FOCUS}`}>{label}<Icon name="right" className="h-4 w-4 text-slate-400" /></a></li>)}
          </ul>
          <p className="text-xs text-slate-500">{T.footerNote}</p>
        </div>
      </div>
    </dialog>
  );
}
