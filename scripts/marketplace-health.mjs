export const DYNAMIC_CHECKS = [
  ['/marketplace/publicadores/raulbelloso/', 200],
  ['/marketplace/plantillas-studio/cumbre-innovacion-liderazgo-2027/', 200],
  ['/marketplace/publicadores/_runtime_probe_/', 404],
];

export async function checkDynamicHealth(base, fetchImpl = fetch) {
  for (const [path, status] of DYNAMIC_CHECKS) {
    const response = await fetchImpl(new URL(path, base), { redirect: 'manual', headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(20000) });
    if (response.status !== status || !response.headers.get('content-type')?.includes('text/html')) throw Object.assign(new Error('DYNAMIC_HEALTH_FAILED'), { code: 'DYNAMIC_HEALTH_FAILED', path, expected: status, received: response.status });
    await response.body?.cancel();
  }
}
