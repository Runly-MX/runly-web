import { getBuildSource, indexingAuthorized, sourceKind } from '../../lib/marketplace-resources/source';
import { resourceSitemap } from '../../lib/marketplace-resources/sitemap';

export const prerender = false;
export async function GET() {
  const headers = { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
  if (!indexingAuthorized() || sourceKind() !== 'hub') return new Response(resourceSitemap([], 'https://runly.mx'), { headers });
  const list = await (await getBuildSource()).list();
  if (list.status !== 'ok') return new Response(null, { status: 503, headers });
  return new Response(resourceSitemap(list.items, 'https://runly.mx'), { headers });
}
