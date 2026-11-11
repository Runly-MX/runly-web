// src/components/marketplace/resources/MarketplaceIntro.tsx
//
// "Qué es el Marketplace": the explanatory section under the catalog. Replaces
// the old side panel so the information has real space and is indexable text.
import { T, TYPE_TEXT } from "../../../lib/marketplace-resources/text";
import { RESOURCE_TYPES, type ResourceType } from "../../../lib/marketplace-resources/types";
import { Icon, TYPE_ICON } from "./icons";
import { FOCUS, TYPE_COVER } from "./parts";
import { useReveal } from "./useReveal";

const STEPS = [
  ["Descubre", "Explora los recursos y revisa quién los publica y con qué nivel de confianza."],
  ["Usa desde Runly", "Importa una copia desde el Marketplace integrado en tu instancia, sin descargar ni copiar archivos."],
  ["Revisa y activa", "Antes de aplicarse ves lo que va a hacer. Las automatizaciones llegan en pausa y tú decides cuándo activarlas."],
] as const;

const TRUST_CARDS = [
  ["official", "shield"],
  ["community-verified", "check"],
  ["community", "users"],
] as const;

const LINKS = [["Módulos oficiales de Runly", "/modulos"], ["Documentación", "/documentacion/modulos"], ["Publicar en Runly", "/runly-developer"]] as const;

export default function MarketplaceIntro({ counts }: { counts: Partial<Record<ResourceType, number>> }) {
  const ref = useReveal<HTMLElement>();
  const delay = (i: number) => ({ "--mk-delay": `${i * 90}ms` }) as React.CSSProperties;
  return (
    <section ref={ref} id="acerca" aria-labelledby="mk-intro-title" className="mt-16 scroll-mt-24 border-t border-slate-200 pt-12" data-mk-intro>
      <div className="mk-reveal max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-[#c2410c]">{T.eyebrow}</p>
        <h2 id="mk-intro-title" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{T.title}</h2>
        <p className="mt-3 text-base text-slate-600">{T.description}</p>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RESOURCE_TYPES.map((t, i) => (
          <li key={t} style={delay(i)} className="mk-reveal group rounded-2xl border border-slate-200 bg-white p-5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-glass motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transform-none ${TYPE_COVER[t]}`}><Icon name={TYPE_ICON[t]} className="h-5 w-5" /></span>
            <h3 className="mt-4 text-base font-bold text-slate-900">{TYPE_TEXT[t].plural}</h3>
            <p className="mt-1 text-sm text-slate-600">{TYPE_TEXT[t].description}</p>
            {counts[t] ? <p className="mt-3 text-xs font-semibold text-slate-500">{T.results(counts[t] as number)} publicados</p> : null}
          </li>
        ))}
      </ul>

      <div className="mk-reveal mt-6 flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">¿Y los módulos?</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">Los módulos (contactos, inventario, finanzas, proyectos y más) son la base de Runly. Las plantillas, automatizaciones y Solutions del Marketplace se apoyan en ellos: una Solution te dice qué módulos necesita antes de instalarse.</p>
        </div>
        <a href="/modulos" className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-[#c2410c] px-4 text-sm font-semibold text-white hover:bg-[#9a3412] ${FOCUS}`}>Ver los módulos<Icon name="right" className="h-4 w-4" /></a>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div className="mk-reveal">
          <h3 className="text-lg font-extrabold text-slate-900">Cómo funciona</h3>
          <ol className="mt-4 space-y-4">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c2410c] text-sm font-bold text-white" aria-hidden="true">{i + 1}</span>
                <span className="text-sm text-slate-600"><span className="block font-bold text-slate-900">{title}</span>{body}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mk-reveal" style={delay(2)}>
          <h3 className="text-lg font-extrabold text-slate-900">En quién confiar</h3>
          <ul className="mt-4 space-y-3">
            {TRUST_CARDS.map(([trust, icon]) => (
              <li key={trust} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-orange-200 hover:bg-orange-50/40 motion-reduce:transition-none">
                <Icon name={icon} className="mt-0.5 h-5 w-5 text-[#c2410c]" />
                <span className="text-sm text-slate-600"><span className="block font-bold text-slate-900">{T.trust[trust]}</span>{T.trustHint[trust]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="mk-reveal mt-10 flex flex-wrap gap-2">
        {LINKS.map(([label, href]) => <li key={href}><a href={href} className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 ${FOCUS} group/l`}>{label}<Icon name="right" className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover/l:translate-x-1 motion-reduce:transform-none" /></a></li>)}
      </ul>
      <p className="mt-6 text-xs text-slate-500">{T.footerNote}</p>
    </section>
  );
}
