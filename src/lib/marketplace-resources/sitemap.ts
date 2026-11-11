import { publisherPath, resourcePath } from './routes';
import type { ResourceSummary } from './types';

export function resourceSitemap(items: ResourceSummary[], site: string) {
  const visible = items.filter(r => r.listed && r.indexable && r.availability === 'available');
  const paths = [...new Set(visible.flatMap(r => [resourcePath(r.type, r.slug), publisherPath(r.publisher.handle)]))];
  const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${escape(new URL(path, site).href)}</loc></url>`).join('')}</urlset>`;
}
