import { useEffect, useState } from 'react';
import { createHubSource, previewUrl } from '../../../lib/marketplace-resources/client';
import { filterResources } from '../../../lib/marketplace-resources/filters';
import { runtimeResourcePath, typePath } from '../../../lib/marketplace-resources/routes';
import { TYPE_TEXT } from '../../../lib/marketplace-resources/text';
import { RESOURCE_TYPES, type ListResult, type ResourceType } from '../../../lib/marketplace-resources/types';
import { TrustBadge } from './parts';
import ResourceStateBlock from './ResourceStateBlock';

export default function RuntimeCatalog({hubUrl,type}: {hubUrl?: string;type?: ResourceType}) {
  const [result,setResult] = useState<ListResult|null>(null), [query,setQuery] = useState(''), [trust,setTrust] = useState('all'), [category,setCategory] = useState('');
  useEffect(()=>{
    let alive = true;
    const load = () => createHubSource({hubUrl}).list().then((r)=>{if(alive)setResult(r);});
    load();
    const timer = setInterval(load,60000);
    window.addEventListener('focus',load);
    return ()=>{alive=false;clearInterval(timer);window.removeEventListener('focus',load);};
  },[hubUrl]);
  if (!result) return <ResourceStateBlock kind="loading"/>;
  if (result.status !== 'ok') return <ResourceStateBlock kind="unavailable"/>;
  const items = result.items.filter((r)=>!type || r.type === type);
  const categories = [...new Set(items.flatMap((r)=>r.categories))].sort();
  const visible = filterResources(items,{query,trust,category});
  return <section className="mt-10" aria-label="Catálogo actualizado de recursos">
    {!type && <nav className="mb-6 flex flex-wrap gap-4" aria-label="Tipos de recurso">{RESOURCE_TYPES.filter((t)=>t === 'studio_template' || items.some((r)=>r.type === t)).map((t)=><a key={t} href={typePath(t)} className="font-semibold text-orange-700 underline">{TYPE_TEXT[t].plural}</a>)}</nav>}
    <h2 className="text-2xl font-bold">{type ? TYPE_TEXT[type].plural : 'Catálogo de recursos'}</h2>
    <form role="search" onSubmit={(e)=>e.preventDefault()} className="my-5 flex flex-wrap gap-3">
      <label>Buscar<input className="ml-2 rounded-xl border p-2" type="search" maxLength={80} value={query} onChange={(e)=>setQuery(e.target.value)}/></label>
      <label>Procedencia<select className="ml-2 rounded-xl border p-2" value={trust} onChange={(e)=>setTrust(e.target.value)}><option value="all">Todas</option><option value="official">Oficial Runly</option><option value="community-verified">Comunidad verificada</option><option value="community">Comunidad</option></select></label>
      <label>Categoría<select className="ml-2 rounded-xl border p-2" value={category} onChange={(e)=>setCategory(e.target.value)}><option value="">Todas</option>{categories.map((c)=><option key={c}>{c}</option>)}</select></label>
    </form>
    <p role="status" className="mb-4 text-sm text-slate-600">{visible.length} recursos disponibles</p>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((r)=><article key={r.resourceKey} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <a href={runtimeResourcePath(r.type,r.slug)} className="block p-5">
        {r.previews[0] && <img src={previewUrl(hubUrl,r.previews[0])} alt={r.previews[0].alt} className="mb-4 aspect-[4/3] w-full rounded-xl object-contain" loading="lazy"/>}
        <TrustBadge trust={r.trust}/><h3 className="mt-3 text-lg font-bold">{r.title}</h3><p className="mt-2 text-sm text-slate-600">{r.summary}</p>
        <p className="mt-3 text-sm">{r.trust === 'official' ? 'Runly · Autoría institucional' : r.publisher.displayName} · v{r.latest?.version}</p>
        <p className="mt-2 text-xs text-slate-500">{r.categories.join(' · ')}</p>
      </a>
    </article>)}</div>
    {!visible.length && <p className="rounded-3xl border border-dashed p-8 text-center text-slate-600">No hay recursos disponibles que coincidan.</p>}
  </section>;
}
