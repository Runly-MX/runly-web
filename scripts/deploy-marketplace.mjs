// Private, immutable Node releases paired with the existing static backup transaction.
import * as fs from 'node:fs';
import { resolve, posix, join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync, spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { deploy, deployPlan, health, checkBuild, checkTargetState, validateTarget, RUNTIME_MARKER } from './deploy-static.mjs';
import { checkDynamicHealth } from './marketplace-health.mjs';

export const ROOT = '/opt/runly-web-runtime';
const SNIPPET = '/etc/nginx/snippets/runly-marketplace.conf';
const SERVICE = 'runly-web-marketplace.service';
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');
const fail = code => { throw Object.assign(new Error(code), { code }); };
export const releaseId = value => {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(value ?? '') || value.includes('..')) fail('RELEASE_ID_INVALID');
  return value;
};
const run = (cmd, args, options = {}) => spawnSync(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8', ...options });
const exec = (cmd, args, options) => { const result = run(cmd, args, options); if (result.status !== 0) fail(`${cmd.toUpperCase()}_FAILED`); return result.stdout; };
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => { fs.writeFileSync(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 }); fs.renameSync(`${file}.tmp`, file); };
const hash = data => createHash('sha256').update(data).digest('hex');

// Whitelist package inputs; never copy the checkout, .env, credentials or operational logs.
export function artifactDigest(directory) {
  const entries = [];
  function walk(path) {
    if (fs.lstatSync(path).isSymbolicLink()) fail('ARTIFACT_SYMLINK_REJECTED');
    for (const entry of fs.readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      const file = join(path, entry.name);
      if (entry.isSymbolicLink()) fail('ARTIFACT_SYMLINK_REJECTED');
      if (entry.isDirectory()) walk(file);
      else entries.push([relative(directory, file).replaceAll('\\', '/'), hash(fs.readFileSync(file))]);
    }
  }
  walk(join(directory, 'dist'));
  for (const name of ['package.json', 'pnpm-lock.yaml', 'marketplace-runtime.nginx.conf']) entries.push([name, hash(fs.readFileSync(join(directory, name)))]);
  return hash(JSON.stringify(entries));
}
function artifact(id) {
  const directory = `${ROOT}/releases/${releaseId(id)}`;
  if (fs.lstatSync(directory).isSymbolicLink() || fs.realpathSync(directory) !== directory) fail('RELEASE_PATH_REJECTED');
  const manifest = json(`${directory}/release.json`);
  if (manifest.id !== id || manifest.sha256 !== artifactDigest(directory) || manifest.platform !== process.platform || manifest.arch !== process.arch || manifest.nodeMajor !== process.versions.node.split('.')[0]) fail('RELEASE_MISMATCH');
  checkBuild(`${directory}/dist/client`);
  if (!fs.existsSync(`${directory}/dist/server/entry.mjs`) || !fs.existsSync(`${directory}/node_modules`)) fail('RUNTIME_MISSING');
  checkDependencyLinks(`${directory}/node_modules`, directory);
  return directory;
}
export function checkDependencyLinks(path, root) {
  if (fs.lstatSync(path).isSymbolicLink()) fail('DEPENDENCY_LINK_ESCAPES_RELEASE');
  for (const entry of fs.readdirSync(path, { withFileTypes: true })) {
    const file = join(path, entry.name);
    if (entry.isSymbolicLink()) {
      const target = fs.realpathSync(file);
      if (!target.startsWith(`${root}/`) && !target.startsWith(`${root}\\`)) fail('DEPENDENCY_LINK_ESCAPES_RELEASE');
    } else if (entry.isDirectory()) checkDependencyLinks(file, root);
  }
}
async function ready() {
  for (let attempt = 0; attempt < 40; attempt++) {
    const response = await fetch('http://127.0.0.1:4398/marketplace/publicadores/_runtime_probe_/', { signal: AbortSignal.timeout(1000) }).catch(() => null);
    if (response?.status === 404) { await response.body?.cancel(); return; }
    await response?.body?.cancel();
    await new Promise(done => setTimeout(done, 250));
  }
  fail('RUNTIME_NOT_READY');
}
function current() {
  const stat = fs.lstatSync(`${ROOT}/current`, { throwIfNoEntry: false });
  if (!stat) return null;
  if (!stat.isSymbolicLink()) fail('CURRENT_NOT_A_LINK');
  const value = fs.readlinkSync(`${ROOT}/current`);
  const match = /^releases\/([A-Za-z0-9._-]+)$/.exec(value);
  if (!match || fs.realpathSync(`${ROOT}/current`) !== artifact(match[1])) fail('CURRENT_PATH_REJECTED');
  return match[1];
}
function switchTo(id) {
  if (!id) { if (fs.existsSync(`${ROOT}/current`)) fs.unlinkSync(`${ROOT}/current`); return; }
  artifact(id);
  const pending = fs.lstatSync(`${ROOT}/current.next`, { throwIfNoEntry: false });
  if (pending) {
    if (!pending.isSymbolicLink() || !/^releases\/[A-Za-z0-9._-]+$/.test(fs.readlinkSync(`${ROOT}/current.next`))) fail('PENDING_LINK_REJECTED');
    fs.unlinkSync(`${ROOT}/current.next`);
  }
  fs.symlinkSync(`releases/${releaseId(id)}`, `${ROOT}/current.next`);
  fs.renameSync(`${ROOT}/current.next`, `${ROOT}/current`);
}
function nginx(content) {
  fs.writeFileSync(`${SNIPPET}.next`, content, { mode: 0o644 });
  fs.renameSync(`${SNIPPET}.next`, SNIPPET);
  exec('nginx', ['-t']); exec('systemctl', ['reload', 'nginx']);
}
function hostCheck(target) {
  validateTarget(target);
  if (target === ROOT || target.startsWith(`${ROOT}/`) || ROOT.startsWith(`${target}/`)) fail('RUNTIME_STATIC_OVERLAP');
  if (!fs.existsSync(`${ROOT}/.managed`) || fs.readFileSync(`${ROOT}/.managed`, 'utf8').trim() !== 'runly-web-runtime-v1' || !fs.existsSync(SNIPPET) || !fs.readFileSync(SNIPPET, 'utf8').startsWith('# Runly Marketplace managed')) fail('HOST_NOT_PREPARED');
  if (fs.realpathSync(ROOT) !== ROOT || fs.lstatSync(SNIPPET).isSymbolicLink()) fail('HOST_PATH_REJECTED');
  if (run('systemctl', ['cat', SERVICE]).status !== 0) fail('SYSTEMD_UNIT_MISSING');
}

// Start the staged artifact before touching live files. PORT=0 is assigned by the OS.
export async function probe(directory) {
  const child = spawn(process.execPath, ['dist/server/entry.mjs'], { cwd: directory, env: { PATH: process.env.PATH, NODE_ENV: 'production', HOST: '127.0.0.1', PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    const base = await new Promise((done, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error('RUNTIME_START_TIMEOUT')), 20000);
      const finish = fn => value => { clearTimeout(timer); fn(value); };
      child.on('error', finish(reject)); child.on('exit', finish(() => reject(new Error('RUNTIME_EXITED'))));
      child.stdout.on('data', chunk => { output = (output + chunk).slice(-4096); const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/); if (match) finish(done)(match[0]); });
      child.stderr.resume();
    });
    await checkDynamicHealth(base);
  } finally {
    child.kill(); const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
    await new Promise(done => !child.pid || child.exitCode !== null || child.signalCode !== null ? done() : child.once('close', done)); clearTimeout(timer);
  }
}

export async function prepare({ id = stamp(), repository = process.cwd() } = {}) {
  releaseId(id);
  const directory = `${ROOT}/releases/${id}`;
  if (fs.existsSync(directory)) fail('RELEASE_EXISTS');
  const pkg = json(`${repository}/package.json`);
  if (pkg.name !== 'runly-web') fail('WEB_CHECKOUT_REQUIRED');
  if (exec('git', ['status', '--porcelain', '--untracked-files=normal'], { cwd: repository }).trim()) fail('CLEAN_CHECKOUT_REQUIRED');
  exec('corepack', ['pnpm', 'build'], { cwd: repository });
  checkBuild(`${repository}/dist/client`);
  fs.mkdirSync(directory, { recursive: true, mode: 0o755 });
  fs.cpSync(`${repository}/dist`, `${directory}/dist`, { recursive: true });
  for (const name of ['package.json', 'pnpm-lock.yaml']) fs.copyFileSync(`${repository}/${name}`, `${directory}/${name}`);
  fs.copyFileSync(`${repository}/infra/marketplace-runtime.nginx.conf`, `${directory}/marketplace-runtime.nginx.conf`);
  exec('corepack', ['pnpm', 'install', '--prod', '--frozen-lockfile', '--ignore-scripts', '--ignore-workspace', '--config.node-linker=isolated', '--config.package-import-method=copy'], { cwd: directory });
  exec('chmod', ['-R', 'go-w,a+rX', directory]);
  checkDependencyLinks(`${directory}/node_modules`, directory);
  writeJson(`${directory}/release.json`, { id, revision: exec('git', ['rev-parse', 'HEAD'], { cwd: repository }).trim(), sha256: artifactDigest(directory), platform: process.platform, arch: process.arch, nodeMajor: process.versions.node.split('.')[0] });
  // The service can read release metadata; the journal, not the release, contains private host state.
  fs.chmodSync(`${directory}/release.json`, 0o644);
  await probe(directory);
  return { prepared: id, activated: false };
}

async function restoreTransaction(transaction) {
  switchTo(transaction.previous);
  if (transaction.previous && transaction.wasActive) exec('systemctl', ['restart', SERVICE]);
  else exec('systemctl', ['stop', SERVICE]);
  exec('systemctl', [transaction.wasEnabled ? 'enable' : 'disable', SERVICE]);
  nginx(transaction.nginx);
  if (transaction.previous && transaction.wasActive) { await ready(); await checkDynamicHealth('http://127.0.0.1:4398'); }
}

export async function publish({ id, target, healthUrl, dryRun = false }) {
  hostCheck(target);
  exec('nginx', ['-t']);
  if (!healthUrl) fail('HTTPS_HEALTH_URL_REQUIRED');
  const base = new URL(healthUrl);
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname !== '/') fail('HTTPS_HEALTH_URL_REQUIRED');
  const directory = artifact(id), previous = current();
  await probe(directory);
  const transactionId = stamp(), journal = `${ROOT}/transactions/${transactionId}.json`;
  const transaction = { id: transactionId, previous, next: id, target, healthUrl, wasActive: run('systemctl', ['is-active', '--quiet', SERVICE]).status === 0, wasEnabled: run('systemctl', ['is-enabled', '--quiet', SERVICE]).status === 0, nginx: fs.readFileSync(SNIPPET, 'utf8'), state: 'pending' };
  if (transaction.wasActive && !previous) fail('ACTIVE_RUNTIME_WITHOUT_MANAGED_RELEASE');
  const runtime = {
    beforeApply: plan => { transaction.backup = plan.release; fs.mkdirSync(`${ROOT}/transactions`, { recursive: true, mode: 0o700 }); writeJson(journal, transaction); },
    activate: async () => { switchTo(id); exec('systemctl', ['restart', SERVICE]); await ready(); nginx(fs.readFileSync(`${directory}/marketplace-runtime.nginx.conf`, 'utf8')); },
    health: async () => { await checkDynamicHealth('http://127.0.0.1:4398'); await checkDynamicHealth(healthUrl); },
    restore: async () => {
      await restoreTransaction(transaction);
      if (!(await health({ target, healthUrl })).ok) fail('RESTORED_STATIC_HEALTH_FAILED');
      if (previous && transaction.wasActive) await checkDynamicHealth(healthUrl);
      transaction.state = 'rolled_back'; writeJson(journal, transaction);
    },
    commit: () => { exec('systemctl', ['enable', SERVICE]); fs.writeFileSync(`${target}/${RUNTIME_MARKER}`, 'paired-runtime-v1\n'); transaction.state = 'healthy'; writeJson(journal, transaction); },
  };
  return deploy({ target, source: `${directory}/dist/client`, owner: 'www-data:www-data', healthUrl, skipBuild: true, dryRun, stamp: transactionId, runtime, run, fsOps: fs });
}

export async function rollbackRuntime({ target, recoverPending = false }) {
  hostCheck(target); checkTargetState(target);
  const journals = fs.readdirSync(`${ROOT}/transactions`).filter(name => name.endsWith('.json')).sort().reverse();
  const file = journals.find(name => { const tx = json(`${ROOT}/transactions/${name}`); return tx.state === (recoverPending ? 'pending' : 'healthy') && tx.target === target; });
  if (!file) fail('NO_RUNTIME_ROLLBACK');
  const transaction = json(`${ROOT}/transactions/${file}`);
  if (current() !== transaction.next && (!recoverPending || current() !== transaction.previous)) fail('ROLLBACK_CURRENT_MISMATCH');
  const plan = deployPlan({ target, preserveAssets: true });
  if (!transaction.backup.startsWith(`${plan.releases}/`) || posix.dirname(transaction.backup) !== plan.releases) fail('BACKUP_PATH_REJECTED');
  checkBuild(transaction.backup);
  const directory = artifact(transaction.next), previousSnippet = fs.readFileSync(SNIPPET, 'utf8');
  try {
    exec(...plan.restore(transaction.backup));
    await restoreTransaction(transaction);
    const result = await health({ target, healthUrl: transaction.healthUrl });
    if (!result.ok) fail('ROLLBACK_HEALTH_FAILED');
    if (transaction.previous && transaction.wasActive) await checkDynamicHealth(transaction.healthUrl);
  } catch (error) {
    // Compensate a failed rollback with the complete version that was running before it.
    try {
      exec(...plan.restore(`${directory}/dist/client`)); switchTo(transaction.next);
      exec('systemctl', ['restart', SERVICE]); await ready(); nginx(previousSnippet);
      await checkDynamicHealth(transaction.healthUrl);
    } catch { fail('ROLLBACK_AND_RECOVERY_FAILED'); }
    throw error;
  }
  transaction.state = 'rolled_back'; writeJson(`${ROOT}/transactions/${file}`, transaction);
  return { restored: transaction.previous, staticBackup: transaction.backup };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.platform !== 'linux') fail('LINUX_HOST_REQUIRED');
    if (process.getuid() !== 0) fail('ROOT_REQUIRED');
    if (fs.realpathSync(process.execPath) !== fs.realpathSync('/usr/bin/node')) fail('USE_SYSTEM_NODE');
    const args = process.argv.slice(2), arg = name => { const index = args.indexOf(`--${name}`); return index < 0 ? undefined : args[index + 1]; };
    const target = args.includes('--target') ? arg('target') : '/var/www/runly.mx';
    hostCheck(target);
    // One writer across prepare, deploy and rollback; a crashed owner leaves a visible lock for review.
    const lock = fs.openSync(`${ROOT}/.lock`, 'wx', 0o600);
    fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, command: args[0], startedAt: new Date().toISOString() }));
    try {
      const result = args[0] === 'prepare' ? await prepare({ id: args.includes('--release') ? arg('release') : undefined })
        : args[0] === 'deploy' ? await publish({ id: arg('release'), target, healthUrl: arg('health-url'), dryRun: args.includes('--dry-run') })
        : ['rollback', 'recover'].includes(args[0]) ? await rollbackRuntime({ target, recoverPending: args[0] === 'recover' }) : fail('COMMAND_REQUIRED');
      console.log(JSON.stringify(result));
    } finally { fs.closeSync(lock); fs.unlinkSync(`${ROOT}/.lock`); }
  } catch (error) { console.error(JSON.stringify({ error: error.code ?? error.message, log: error.log, recovery: error.recovery, path: error.path, received: error.received })); process.exitCode = 1; }
}
