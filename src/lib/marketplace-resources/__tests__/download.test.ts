import { afterEach, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { downloadStudioPackage, studioFilename } from '../download';
import { createFixtureSource } from '../fixtures';
import { resourceIdentity } from '../identity';
import { resourceSitemap } from '../sitemap';

afterEach(() => vi.unstubAllGlobals());
async function fixture() {
  const source = createFixtureSource(), list = await source.list();
  if (list.status !== 'ok') throw new Error('fixture');
  const item = list.items.find(r => r.type === 'studio_template' && r.availability === 'available')!;
  const result = await source.detail(item.type, item.slug);
  if (result.status !== 'ok') throw new Error('fixture');
  const bytes = new TextEncoder().encode('original package'), resource = result.resource;
  resource.latest = { ...resource.latest!, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
  resource.officialAttestation = null;
  return { resource, bytes };
}
it('downloads original bytes through H7 with no credentials and a readable name', async () => {
  const { resource, bytes } = await fixture();
  const fetcher = vi.fn(async (url: string, _init?: RequestInit) => url.includes('/packages/') ? new Response(bytes) : Response.json({ schemaVersion: 1, resource }));
  vi.stubGlobal('fetch', fetcher);
  expect(await (await downloadStudioPackage(resource, 'https://hub.example.test')).text()).toBe('original package');
  expect(fetcher.mock.calls[1][0]).toContain(`/catalog/resources/packages/${resource.latest!.sha256}`);
  expect(fetcher.mock.calls[1][1]).toMatchObject({ credentials: 'omit', redirect: 'error', cache: 'no-store' });
  expect(studioFilename(resource)).toBe(`${resource.slug}-${resource.latest!.version}.runlystudio`);
});
it('rejects tampering, oversized bytes and a changed or withdrawn release', async () => {
  for (const scenario of ['tampered', 'oversized', 'changed', 'gone']) {
    const { resource, bytes } = await fixture(), changed = structuredClone(resource);
    if (scenario === 'changed') changed.latest!.releaseId = '22222222-2222-4222-8222-222222222222';
    const fetcher = vi.fn(async (url: string, _init?: RequestInit) => url.includes('/packages/')
      ? new Response(scenario === 'oversized' ? new Uint8Array(bytes.length + 1) : new Uint8Array(bytes.length))
      : scenario === 'gone' ? Response.json({ availability: 'revoked' }, { status: 410 }) : Response.json({ schemaVersion: 1, resource: changed }));
    vi.stubGlobal('fetch', fetcher);
    await expect(downloadStudioPackage(resource, 'https://hub.example.test')).rejects.toThrow();
    if (scenario === 'changed' || scenario === 'gone') expect(fetcher).toHaveBeenCalledTimes(1);
  }
});
it('keeps the registered publisher separate from institutional provenance and unknown creators', async () => {
  const { resource } = await fixture();
  resource.trust = 'official';
  expect(resourceIdentity(resource)).toMatchObject({ publisher: resource.publisher, organization: { name: 'Runly' }, creator: null, contributors: [] });
  resource.trust = 'community-verified';
  expect(resourceIdentity(resource).organization).toBeNull();
});
it('the current sitemap includes available opt-in resources and profiles only', async () => {
  const { resource } = await fixture();
  const xml = resourceSitemap([resource, { ...resource, slug: 'gone', availability: 'revoked' }, { ...resource, slug: 'private', listed: false }, { ...resource, slug: 'hidden', indexable: false }], 'https://example.test');
  expect(xml).toContain(`/plantillas-studio/${resource.slug}/`);
  expect(xml).toContain(`/publicadores/${resource.publisher.handle}/`);
  for (const slug of ['gone', 'private', 'hidden']) expect(xml).not.toContain(`/plantillas-studio/${slug}/`);
});
