import { hubBaseUrl } from '../marketplace';
import { createHubSource } from './client';
import type { ResourceDetail } from './types';

// The Hub checks the signed release. The browser binds the received bytes to the
// exact current release before saving; previews never enter this path.
export async function downloadStudioPackage(resource: ResourceDetail, hubUrl?: string | null): Promise<Blob> {
  const current = await createHubSource({ hubUrl }).detail(resource.type, resource.slug);
  if (resource.type !== 'studio_template' || current.status !== 'ok' || current.resource.availability !== 'available'
    || !resource.latest || current.resource.latest?.releaseId !== resource.latest.releaseId
    || current.resource.latest.sha256 !== resource.latest.sha256 || current.resource.latest.size !== resource.latest.size) {
    throw new Error('La publicación cambió o ya no está disponible. Actualiza la página.');
  }
  const { sha256, size } = resource.latest;
  if (size < 1 || size > 26214400) throw new Error('El tamaño del paquete no es válido.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`${hubBaseUrl(hubUrl)}/api/v1/marketplace/catalog/resources/packages/${sha256}`, {
      credentials: 'omit', cache: 'no-store', redirect: 'error', signal: controller.signal,
    });
    if (!response.ok || !response.body) throw new Error('La plantilla no está disponible para descargar.');
    const reader = response.body.getReader(), chunks: Uint8Array<ArrayBuffer>[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > size) { await reader.cancel(); throw new Error('El paquete no coincide con la publicación.'); }
      chunks.push(value);
    }
    const blob = new Blob(chunks, { type: 'application/octet-stream' });
    const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())), b => b.toString(16).padStart(2, '0')).join('');
    if (length !== size || digest !== sha256) throw new Error('El paquete no coincide con la publicación.');
    return blob;
  } finally { clearTimeout(timer); }
}

export const studioFilename = (resource: ResourceDetail) => `${resource.slug}-${resource.latest!.version.replace(/[^A-Za-z0-9.+-]/g, '-')}.runlystudio`;
