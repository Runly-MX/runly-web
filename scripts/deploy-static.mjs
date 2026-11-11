// Guarded static deploy of runly.mx (decision D9). The target must mirror the
// build exactly (rsync --delete-after) so pages removed from the build — e.g. a
// revoked Marketplace module — stop being served. Guardrails:
//   - explicit absolute target, never "/", shallow or system paths, never a symlink;
//   - target must be empty (first deploy) or carry the .runly-web-target marker;
//   - mandatory successful build and dist structure check;
//   - previous tree saved under <target>.releases/<stamp> (outside the target) for rollback;
//   - dry-run first (always shown); --dry-run stops there;
//   - health check after the swap; automatic restore of the previous release on failure.
// Usage (on the VPS):
//   node scripts/deploy-static.mjs --target /var/www/runly.mx [--dry-run] [--owner www-data:www-data] [--health-url https://runly.mx]
//   node scripts/deploy-static.mjs --target /var/www/runly.mx --rollback
//   node scripts/deploy-static.mjs --target /var/www/runly.mx --adopt --confirm "ADOPT RUNLY.MX TARGET"   (once, existing tree)
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readdirSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MARKER = '.runly-web-target';
// Catalog v1 compatibility mirror (Runly 'Disponibles' default URL). Never deleted
// by the sync; a non-empty production index is never silently replaced.
export const CATALOG_V1_INDEX = 'catalog/v1/index.json';
const FORBIDDEN = new Set(['/', '/bin', '/boot', '/dev', '/etc', '/home', '/lib', '/opt', '/proc', '/root', '/run', '/sbin', '/srv', '/sys', '/tmp', '/usr', '/var', '/var/www', '/var/lib', '/var/log']);
const REQUIRED_BUILD = ['index.html', 'modulos/index.html', 'en/modulos/index.html', 'sitemap-index.xml', 'robots.txt', 'catalog/v1/index.json'];
const fail = (code) => { throw Object.assign(new Error(code), { code }); };

// Pure validation of the requested paths (POSIX production paths).
export function validateTarget(target, source = 'dist/client') {
  if (typeof target !== 'string' || !target.trim()) fail('TARGET_REQUIRED');
  if (!target.startsWith('/') || target.includes('\0') || /\s/.test(target)) fail('TARGET_MUST_BE_ABSOLUTE');
  const normalized = posix.normalize(target).replace(/\/+$/, '') || '/';
  if (normalized !== (target.replace(/\/+$/, '') || '/') || target.split('/').includes('..')) fail('TARGET_NOT_NORMALIZED');
  if (FORBIDDEN.has(normalized) || normalized.split('/').filter(Boolean).length < 3) fail('TARGET_TOO_BROAD');
  const src = posix.normalize(source.replace(/\\/g, '/')).replace(/\/+$/, '');
  if (src.startsWith('/') && (src === normalized || src.startsWith(normalized + '/') || normalized.startsWith(src + '/'))) fail('TARGET_OVERLAPS_SOURCE');
  return normalized;
}

export function deployPlan({ target, source = 'dist/client', owner = null, stamp = new Date().toISOString().replace(/[:.]/g, '-'), keep = 5 }) {
  const dir = validateTarget(target, source);
  if (owner !== null && !/^[a-z_][a-z0-9_-]{0,31}:[a-z_][a-z0-9_-]{0,31}$/.test(owner)) fail('OWNER_INVALID');
  const releases = `${dir}.releases`;
  const sync = (from, to, extra = []) => ['rsync', ['-a', '--delete-after', '--filter', `P ${MARKER}`, '--filter', 'P /catalog/**', ...(owner ? [`--chown=${owner}`] : []), ...extra, `${from.replace(/\/+$/, '')}/`, `${to}/`]];
  return {
    target: dir, releases, release: `${releases}/${stamp}`, keep,
    build: ['pnpm', ['build']],
    backup: sync(dir, `${releases}/${stamp}`),
    dryRun: sync(source, dir, ['--dry-run', '--itemize-changes']),
    apply: sync(source, dir),
    restore: (release) => sync(release, dir),
  };
}

export function checkBuild(source, exists = existsSync) {
  const missing = REQUIRED_BUILD.filter((file) => !exists(resolve(source, file)));
  if (missing.length) throw Object.assign(new Error('BUILD_INCOMPLETE'), { code: 'BUILD_INCOMPLETE', missing });
}

// Refuse to overwrite a production v1 index that lists modules with a different one.
export function checkCatalogV1(source, target, fs = { existsSync, readFileSync }, { replace = false } = {}) {
  const live = `${target}/${CATALOG_V1_INDEX}`;
  if (!fs.existsSync(live)) return { live: false };
  let current;
  try { current = JSON.parse(fs.readFileSync(live, 'utf8')); } catch { fail('CATALOG_V1_UNREADABLE'); }
  const next = fs.readFileSync(resolve(source, CATALOG_V1_INDEX), 'utf8');
  if (Array.isArray(current?.modules) && current.modules.length > 0 && JSON.stringify(current) !== JSON.stringify(JSON.parse(next)) && !replace) fail('CATALOG_V1_WOULD_BE_REPLACED');
  return { live: true, modules: current?.modules?.length ?? 0 };
}

export function checkTargetState(target, fs = { existsSync, lstatSync, readdirSync }) {
  if (!fs.existsSync(target)) fail('TARGET_MISSING');
  if (fs.lstatSync(target).isSymbolicLink() || !fs.lstatSync(target).isDirectory()) fail('TARGET_NOT_A_DIRECTORY');
  const entries = fs.readdirSync(target);
  if (entries.length && !entries.includes(MARKER)) fail('TARGET_NOT_MANAGED');
  return { firstDeploy: entries.length === 0 };
}

// Orchestration with injectable effects; returns the step log (no secrets).
export async function deploy({ target, source = 'dist/client', owner = null, dryRun = false, healthUrl = null, run, fsOps, fetchImpl = fetch, keep = 5, stamp, replaceCatalogV1 = false }) {
  const plan = deployPlan({ target, source, owner, stamp, keep });
  const log = [];
  const exec = (step, [command, args]) => { log.push(step); const result = run(command, args); if (result.status !== 0) fail(`${step.toUpperCase()}_FAILED`); return result; };
  exec('build', plan.build);
  checkBuild(source, fsOps.existsSync); log.push('build_checked');
  const state = checkTargetState(plan.target, fsOps);
  const catalogV1 = checkCatalogV1(source, plan.target, fsOps, { replace: replaceCatalogV1 }); log.push('catalog_v1_checked');
  const preview = exec('dry_run', plan.dryRun);
  const deletions = String(preview.stdout ?? '').split('\n').filter((line) => line.startsWith('*deleting')).length;
  if (dryRun) return { log, dryRun: true, deletions, firstDeploy: state.firstDeploy, catalogV1 };
  if (!state.firstDeploy) { fsOps.mkdirSync(plan.releases, { recursive: true }); exec('backup', plan.backup); }
  exec('apply', plan.apply);
  if (state.firstDeploy) fsOps.writeFileSync(`${plan.target}/${MARKER}`, 'runly-web static deploy target\n');
  log.push('marker');
  const healthy = await health({ target: plan.target, healthUrl, exists: fsOps.existsSync, fetchImpl });
  if (!healthy.ok) {
    if (!state.firstDeploy) { exec('restore', plan.restore(plan.release)); log.push('restored_previous_release'); }
    throw Object.assign(new Error('HEALTH_CHECK_FAILED'), { code: 'HEALTH_CHECK_FAILED', log, detail: healthy });
  }
  log.push('healthy');
  pruneReleases(plan.releases, keep, fsOps);
  return { log, deletions, firstDeploy: state.firstDeploy, release: state.firstDeploy ? null : plan.release };
}

export async function health({ target, healthUrl, exists = existsSync, fetchImpl = fetch }) {
  const files = REQUIRED_BUILD.every((file) => exists(`${target}/${file}`));
  if (!files) return { ok: false, reason: 'FILES_MISSING' };
  if (!healthUrl) return { ok: true };
  for (const path of ['/', '/modulos/', '/en/modulos/']) {
    const response = await fetchImpl(new URL(path, healthUrl), { redirect: 'manual' }).catch(() => null);
    if (response?.status !== 200) return { ok: false, reason: `HTTP_${response?.status ?? 'UNREACHABLE'}`, path };
  }
  return { ok: true };
}

export function pruneReleases(releases, keep, fsOps) {
  if (!fsOps.existsSync(releases)) return [];
  const old = fsOps.readdirSync(releases).sort().reverse().slice(keep);
  for (const name of old) fsOps.rmSync(`${releases}/${name}`, { recursive: true, force: true });
  return old;
}

// One-time adoption of an existing, unmarked runly.mx tree (previous cp -a deploys).
// Only a tree that already looks like this site is marked; nothing is deleted.
export function adopt({ target, confirm, fsOps }) {
  const dir = validateTarget(target);
  if (confirm !== 'ADOPT RUNLY.MX TARGET') fail('ADOPT_CONFIRMATION_REQUIRED');
  if (!fsOps.existsSync(dir) || fsOps.lstatSync(dir).isSymbolicLink() || !fsOps.lstatSync(dir).isDirectory()) fail('TARGET_NOT_A_DIRECTORY');
  if (!['index.html', 'sitemap-index.xml', 'robots.txt'].every((file) => fsOps.existsSync(`${dir}/${file}`))) fail('TARGET_NOT_RECOGNISED');
  fsOps.writeFileSync(`${dir}/${MARKER}`, 'runly-web static deploy target\n');
  return { adopted: dir };
}

export function rollback({ target, run, fsOps }) {
  const plan = deployPlan({ target });
  const latest = fsOps.existsSync(plan.releases) ? fsOps.readdirSync(plan.releases).sort().at(-1) : null;
  if (!latest) fail('NO_RELEASE_TO_RESTORE');
  checkTargetState(plan.target, fsOps);
  const [command, args] = plan.restore(`${plan.releases}/${latest}`);
  if (run(command, args).status !== 0) fail('RESTORE_FAILED');
  return { restored: `${plan.releases}/${latest}` };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : null; };
  const run = (command, args) => spawnSync(command, args, { stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' });
  const fsOps = { existsSync, lstatSync, readdirSync, mkdirSync, writeFileSync, rmSync, readFileSync };
  try {
    const result = process.argv.includes('--adopt')
      ? adopt({ target: arg('target'), confirm: arg('confirm'), fsOps })
      : process.argv.includes('--rollback')
      ? rollback({ target: arg('target'), run, fsOps })
      : await deploy({ target: arg('target'), owner: arg('owner'), dryRun: process.argv.includes('--dry-run'), healthUrl: arg('health-url'), replaceCatalogV1: process.argv.includes('--replace-catalog-v1'), run, fsOps });
    console.log(JSON.stringify(result));
  } catch (error) { console.error(JSON.stringify({ error: error.code ?? 'DEPLOY_FAILED', missing: error.missing, log: error.log })); process.exitCode = 1; }
}
