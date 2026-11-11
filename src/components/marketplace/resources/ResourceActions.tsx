import { useState } from 'react';
import { downloadStudioPackage, studioFilename } from '../../../lib/marketplace-resources/download';
import type { ResourceDetail } from '../../../lib/marketplace-resources/types';

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
  return <section data-resource-actions className="rounded-3xl border border-orange-200 p-5" aria-label="Usar recurso">
    <div className="flex flex-wrap gap-3">
      {resource.type === 'studio_template' && resource.latest && <button type="button" disabled={busy} onClick={download} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Verificando descarga…' : 'Descargar .runlystudio'}</button>}
      <button type="button" aria-expanded={guide} onClick={() => setGuide(!guide)} className="rounded-full border px-4 py-2 text-sm font-semibold">Usar en Runly</button>
    </div>
    <p className="mt-3 text-sm">Licencia: {resource.license}. Conserva los créditos y cumple sus condiciones al utilizar o compartir una copia.</p>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {guide && <div data-use-in-runly className="mt-4 text-sm">
      <p>Accede a tu instancia de Runly e inicia sesión. Selecciona la empresa donde tienes permiso para crear la copia.</p>
      {resource.type === 'studio_template' ? <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>En Studio, abre Importar diseño o plantilla → Desde Marketplace.</li>
        <li>Busca «{resource.title}» y selecciona la versión {resource.latest?.version} de {resource.publisher.displayName}.</li>
        <li>Revisa las páginas, recursos, licencia y destino. Confirma Crear copia para empezar a editar.</li>
      </ol> : <p className="mt-2">Abre {resource.install?.resourcePath}, busca «{resource.title}» y revisa la importación antes de confirmarla.</p>}
      <p className="mt-2">La instancia verifica la release y el archivo. La publicación original se conserva; no se modifica ningún diseño sin tu confirmación.</p>
    </div>}
  </section>;
}
