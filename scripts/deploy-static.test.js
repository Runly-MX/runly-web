import { test, expect } from 'vitest';
import { resolve } from 'node:path';
import { validateTarget, deployPlan, deploy, rollback, adopt, MARKER, RUNTIME_MARKER, checkTargetState, checkCatalogV1, pruneReleases } from './deploy-static.mjs';

const TARGET = '/var/www/runly.mx';
const PAGES = ['index.html', 'modulos/index.html', 'en/modulos/index.html', 'sitemap-index.xml', 'robots.txt', 'catalog/v1/index.json'];
const EMPTY_V1 = JSON.stringify({ schemaVersion: 1, generatedAt: '2026-10-04T00:00:00.000Z', modules: [] });

// Explicit in-memory filesystem: build files (OS paths via resolve) + POSIX target tree.
function fakeFs({ entries = [MARKER, 'index.html'], releases = [], built = true, live = EMPTY_V1, targetFiles = PAGES } = {}) {
  const dirs = new Map([[TARGET, [...entries]], [`${TARGET}.releases`, [...releases]]]);
  const files = new Map(targetFiles.map((p) => [`${TARGET}/${p}`, p === 'catalog/v1/index.json' ? live : 'x']));
  if (built) for (const p of PAGES) files.set(resolve('dist/client', p), p === 'catalog/v1/index.json' ? EMPTY_V1 : 'x');
  return {
    dirs, files,
    existsSync: (path) => dirs.has(path) || files.has(path),
    lstatSync: (path) => ({ isSymbolicLink: () => false, isDirectory: () => dirs.has(path) }),
    readdirSync: (path) => dirs.get(path) ?? [],
    readFileSync: (path) => files.get(path),
    mkdirSync: (path) => { if (!dirs.has(path)) dirs.set(path, []); },
    writeFileSync: (path, content) => files.set(path, content),
    rmSync: (path) => { const parent = path.slice(0, path.lastIndexOf('/')), name = path.slice(path.lastIndexOf('/') + 1); dirs.set(parent, (dirs.get(parent) ?? []).filter((n) => n !== name)); },
  };
}
const runner = (failOn = null, stdout = '') => { const calls = []; return { calls, run: (command, args) => { calls.push([command, ...args]); return { status: failOn && args.includes(failOn) ? 1 : 0, stdout: args.includes('--dry-run') ? stdout : '' }; } }; };

test('target guardrails: explicit, absolute, normalized, not broad, not overlapping the build', () => {
  for (const [target, code] of [[undefined, 'TARGET_REQUIRED'], ['', 'TARGET_REQUIRED'], ['/', 'TARGET_TOO_BROAD'], ['var/www/runly.mx', 'TARGET_MUST_BE_ABSOLUTE'], ['/var/www', 'TARGET_TOO_BROAD'], ['/srv', 'TARGET_TOO_BROAD'], ['/var/www/../../etc/x', 'TARGET_NOT_NORMALIZED'], ['/var/www/runly mx', 'TARGET_MUST_BE_ABSOLUTE'], ['/opt/runly-web/dist', 'TARGET_OVERLAPS_SOURCE']])
    expect(() => validateTarget(target, '/opt/runly-web/dist'), String(target)).toThrow(code);
  expect(validateTarget('/var/www/runly.mx/')).toBe(TARGET);
});

test('rsync never deletes outside the target, protects the marker and the catalog mirror; releases live outside', () => {
  const plan = deployPlan({ target: TARGET, owner: 'www-data:www-data', stamp: 's1' });
  expect(plan.apply).toEqual(['rsync', ['-a', '--delete-after', '--filter', `P ${MARKER}`, '--filter', `P ${RUNTIME_MARKER}`, '--filter', 'P /catalog/**', '--chown=www-data:www-data', 'dist/client/', `${TARGET}/`]]);
  expect(plan.dryRun[1]).toContain('--dry-run');
  expect(plan.release).toBe(`${TARGET}.releases/s1`);
  expect(plan.release.startsWith(`${TARGET}/`)).toBe(false);
  expect(() => deployPlan({ target: TARGET, owner: 'root;rm -rf /' })).toThrow('OWNER_INVALID');
});

test('unmanaged non-empty targets are refused; an empty target is a first deploy', () => {
  expect(() => checkTargetState(TARGET, fakeFs({ entries: ['something-else'] }))).toThrow('TARGET_NOT_MANAGED');
  expect(checkTargetState(TARGET, fakeFs({ entries: [] })).firstDeploy).toBe(true);
});

test('deploy order: build, checks, dry-run, backup, apply, health; --dry-run stops before changes', async () => {
  const fs = fakeFs(), r = runner(null, '*deleting   modulos/custom.old/index.html\n>f+++++++++ index.html\n');
  const preview = await deploy({ target: TARGET, dryRun: true, run: r.run, fsOps: fs, stamp: 's1' });
  expect([preview.dryRun, preview.deletions, r.calls.map((c) => c[0])]).toEqual([true, 1, ['pnpm', 'rsync']]);
  const done = await deploy({ target: TARGET, run: r.run, fsOps: fs, stamp: 's2' });
  expect(done.log).toEqual(['build', 'build_checked', 'catalog_v1_checked', 'dry_run', 'backup', 'apply', 'marker', 'healthy']);
  expect(done.release).toBe(`${TARGET}.releases/s2`);
});

test('a failed build or a failed health check never leaves a broken site', async () => {
  await expect(deploy({ target: TARGET, run: runner('build').run, fsOps: fakeFs(), stamp: 's1' })).rejects.toThrow('BUILD_FAILED');
  await expect(deploy({ target: TARGET, run: runner().run, fsOps: fakeFs({ built: false }), stamp: 's1' })).rejects.toThrow('BUILD_INCOMPLETE');
  const r = runner();
  const error = await deploy({ target: TARGET, run: r.run, fsOps: fakeFs(), stamp: 's3', healthUrl: 'https://runly.mx', fetchImpl: async () => ({ status: 502 }) }).catch((e) => e);
  expect(error.code).toBe('HEALTH_CHECK_FAILED');
  expect(error.log).toContain('restored_previous_release');
  expect(r.calls.at(-1).slice(-2)).toEqual([`${TARGET}.releases/s3/`, `${TARGET}/`]);
});

test('catalog v1 compatibility mirror is never silently replaced', async () => {
  const live = JSON.stringify({ schemaVersion: 1, generatedAt: '2026-10-08T00:00:00.000Z', modules: [{ key: 'custom.x' }] });
  expect(checkCatalogV1('dist/client', TARGET, fakeFs())).toEqual({ live: true, modules: 0 });
  expect(() => checkCatalogV1('dist/client', TARGET, fakeFs({ live }))).toThrow('CATALOG_V1_WOULD_BE_REPLACED');
  expect(checkCatalogV1('dist/client', TARGET, fakeFs({ live }), { replace: true }).modules).toBe(1);
  await expect(deploy({ target: TARGET, run: runner().run, fsOps: fakeFs({ live }), stamp: 's4' })).rejects.toThrow('CATALOG_V1_WOULD_BE_REPLACED');
});

test('rollback restores the newest release; old releases are pruned', () => {
  const fs = fakeFs({ releases: ['2026-10-01', '2026-10-09', '2026-10-05'] }), r = runner();
  expect(rollback({ target: TARGET, run: r.run, fsOps: fs }).restored).toBe(`${TARGET}.releases/2026-10-09`);
  expect(() => rollback({ target: TARGET, run: r.run, fsOps: fakeFs() })).toThrow('NO_RELEASE_TO_RESTORE');
  expect(pruneReleases(`${TARGET}.releases`, 1, fs)).toEqual(['2026-10-05', '2026-10-01']);
});

test('existing unmarked tree: explicit one-time adoption only for a recognised runly.mx tree', () => {
  const fs = fakeFs({ entries: ['index.html', 'sitemap-index.xml', 'robots.txt'] });
  expect(() => adopt({ target: TARGET, fsOps: fs })).toThrow('ADOPT_CONFIRMATION_REQUIRED');
  expect(adopt({ target: TARGET, confirm: 'ADOPT RUNLY.MX TARGET', fsOps: fs }).adopted).toBe(TARGET);
  expect(fs.files.has(`${TARGET}/${MARKER}`)).toBe(true);
  const other = fakeFs({ targetFiles: [] });
  expect(() => adopt({ target: TARGET, confirm: 'ADOPT RUNLY.MX TARGET', fsOps: other })).toThrow('TARGET_NOT_RECOGNISED');
});

test('paired runtime failures restore static files and runtime, including a partial rsync failure', async () => {
  for (const failure of ['apply', 'activate', 'health', 'restore']) {
    const fs = fakeFs(), events = [], r = runner();
    const runtime = {
      beforeApply: () => events.push('journal'),
      activate: () => { events.push('activate'); if (failure === 'activate') throw Error('RESTART_FAILED'); },
      health: () => { events.push('health'); if (['health', 'restore'].includes(failure)) throw Error('DYNAMIC_HEALTH_FAILED'); },
      restore: () => { events.push('restore'); if (failure === 'restore') throw Error('RECOVERY_FAILED'); },
      commit: () => events.push('commit'),
    };
    let syncs = 0;
    const run = (command, args) => { const out = r.run(command, args); if (command === 'rsync' && !args.includes('--dry-run') && ++syncs === 2 && failure === 'apply') return { status: 1 }; return out; };
    const error = await deploy({ target: TARGET, run, fsOps: fs, stamp: 'pair', skipBuild: true, runtime }).catch(e => e);
    expect(error).toBeInstanceOf(Error);
    expect(events.at(-1)).toBe('restore'); expect(events).not.toContain('commit');
    expect(r.calls.at(-1)).toContain(`${TARGET}.releases/pair/`);
    expect(r.calls.some(call => call.includes('build'))).toBe(false);
    if (failure === 'restore') expect(error.code).toBe('ROLLBACK_FAILED');
  }
});

test('paired dry-run never activates; success retains the paired backup and old hashed assets', async () => {
  const fs = fakeFs({ releases: ['old-a', 'old-b'] }), r = runner(), events = [];
  const runtime = Object.fromEntries(['beforeApply', 'activate', 'health', 'restore', 'commit'].map(key => [key, () => events.push(key)]));
  await deploy({ target: TARGET, run: r.run, fsOps: fs, dryRun: true, skipBuild: true, runtime });
  expect(events).toEqual([]);
  await deploy({ target: TARGET, run: r.run, fsOps: fs, skipBuild: true, runtime, keep: 1 });
  expect(events).toEqual(['beforeApply', 'activate', 'health', 'commit']);
  expect(fs.dirs.get(`${TARGET}.releases`)).toEqual(['old-a', 'old-b']);
  expect(r.calls.at(-1)).toContain('P /_astro/**');
});

test('legacy static deploy/rollback cannot detach an activated runtime, and release paths reject traversal', async () => {
  const fs = fakeFs(); fs.files.set(`${TARGET}/${RUNTIME_MARKER}`, 'managed');
  await expect(deploy({ target: TARGET, run: runner().run, fsOps: fs })).rejects.toThrow('USE_MARKETPLACE_DEPLOY');
  expect(() => rollback({ target: TARGET, run: runner().run, fsOps: fs })).toThrow('USE_MARKETPLACE_DEPLOY');
  expect(() => deployPlan({ target: TARGET, stamp: '../outside' })).toThrow('STAMP_INVALID');
});
