import { test, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { releaseId, artifactDigest } from './deploy-marketplace.mjs';
import { checkDynamicHealth } from './marketplace-health.mjs';

test('release ids cannot escape the private release directory', () => {
  for (const id of ['../x', '/tmp/x', 'a/b', '.', 'a..b', '', undefined]) expect(() => releaseId(id)).toThrow('RELEASE_ID_INVALID');
  expect(releaseId('2026-11-10T12-00-00Z')).toBe('2026-11-10T12-00-00Z');
});
test('the paired artifact binds client, server, dependency lock and Nginx config', () => {
  const directory = mkdtempSync(join(tmpdir(), 'runly-runtime-'));
  try {
    mkdirSync(join(directory, 'dist/server'), { recursive: true }); mkdirSync(join(directory, 'dist/client'));
    for (const file of ['dist/server/entry.mjs', 'dist/client/index.html', 'package.json', 'pnpm-lock.yaml', 'marketplace-runtime.nginx.conf']) writeFileSync(join(directory, file), 'original');
    const original = artifactDigest(directory);
    writeFileSync(join(directory, 'dist/client/index.html'), 'different client'); expect(artifactDigest(directory)).not.toBe(original);
    writeFileSync(join(directory, 'dist/client/index.html'), 'original');
    writeFileSync(join(directory, 'pnpm-lock.yaml'), 'different dependencies'); expect(artifactDigest(directory)).not.toBe(original);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test('dynamic health requires real HTML 200s and an actual 404, refuses proxy fallback and 503', async () => {
  const response = status => new Response('<html></html>', { status, headers: { 'Content-Type': 'text/html' } });
  await expect(checkDynamicHealth('https://example.test', async url => response(url.pathname.includes('_runtime_probe_') ? 404 : 200))).resolves.toBeUndefined();
  for (const status of [404, 410, 503]) await expect(checkDynamicHealth('https://example.test', async () => response(status))).rejects.toThrow('DYNAMIC_HEALTH_FAILED');
  await expect(checkDynamicHealth('https://example.test', async () => new Response('{}', { headers: { 'Content-Type': 'application/json' } }))).rejects.toThrow('DYNAMIC_HEALTH_FAILED');
});
