import { useState } from 'react';
import { downloadStudioPackage, studioFilename } from '../../../lib/marketplace-resources/download';
import type { ResourceDetail } from '../../../lib/marketplace-resources/types';
import { Icon } from './icons';
import { FOCUS } from './parts';

export default function ResourceActions({ resource, hubUrl }: { resource: ResourceDetail; hubUrl?: string | null }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [guide, setGuide] = useState(false);
  async function download() {
    setBusy(true); setError('');
    try {
      const blob = await downloadStudioPackage(resource, hubUrl);
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = studioFilename(resource); link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo descargar la plantilla.'); }
    finally { setBusy(false); }
  }
  const studio = resource.type === 'studio_template';
  return <section data-resource-actions aria-label="Usar recurso" className="space-y-3">
    <button type="button" aria-expanded={guide} onClick={() => setGuide(!guide)} className={`runly-gradient-btn inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-base font-bold text-white ${FOCUS}`}>
      <Icon name="sparkles" className="h-5 w-5" />Usar en Runly
    </button>
    {studio && resource.latest && <button type="button" disabled={busy} onClick={download} className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-60 motion-reduce:transition-none ${FOCUS}`}>
      <Icon name="download" className="h-4 w-4" />{busy ? 'Verificando descarga…' : 'Descargar .runlystudio'}
    </button>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    {guide && <div data-use-in-runly className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      <p>Accede a tu instancia de Runly e inicia sesión. Selecciona la empresa donde tienes permiso para crear la copia.</p>
      {studio ? <ol className="mt-3 space-y-2">
        {[
          'En Studio, abre Importar diseño o plantilla → Desde Marketplace.',
          `Busca «${resource.title}» y selecciona la versión ${resource.latest?.version} de ${resource.publisher.displayName}.`,
          'Revisa las páginas, recursos, licencia y destino. Confirma Crear copia para empezar a editar.',
        ].map((step, i) => <li key={i} className="flex gap-2.5"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c2410c] text-[11px] font-bold text-white">{i + 1}</span><span>{step}</span></li>)}
      </ol> : <p className="mt-2">Abre {resource.install?.resourcePath}, busca «{resource.title}» y revisa la importación antes de confirmarla.</p>}
      <p className="mt-3 text-xs text-slate-500">La instancia verifica la release y el archivo. La publicación original se conserva; no se modifica ningún diseño sin tu confirmación.</p>
    </div>}
    <p className="text-xs text-slate-500">Licencia: {resource.license}. Conserva los créditos y cumple sus condiciones al utilizar o compartir una copia.</p>
  </section>;
}
