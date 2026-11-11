// Directed Linux/Nginx acceptance against an existing build. No build, publication or VPS access.
import { execFileSync } from 'node:child_process';
import { mkdirSync, cpSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const output = resolve('.artifacts/marketplace-hosting'), name = `runly-web-hosting-${Date.now()}`, proxy = `${name}-nginx`;
const docker = args => execFileSync('docker', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 8 * 1024 * 1024 }).trim();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const checks = [];
mkdirSync(output, { recursive: true });
for (const file of ['package.json', 'pnpm-lock.yaml']) cpSync(file, join(output, file));
cpSync('dist', join(output, 'dist'), { recursive: true });
mkdirSync(join(output, 'scripts'), { recursive: true });
for (const file of ['deploy-static.mjs', 'deploy-marketplace.mjs', 'marketplace-health.mjs']) cpSync(`scripts/${file}`, join(output, 'scripts', file));
cpSync('infra/marketplace-runtime.nginx.conf', join(output, 'marketplace-runtime.nginx.conf'));
writeFileSync(join(output, 'control.json'), JSON.stringify({ mode: 'live', appeared: false }));
writeFileSync(join(output, 'fixture-fetch.mjs'), `
import {readFileSync} from 'node:fs';
const original=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
 const url=new URL(typeof input==='string'?input:input.url??String(input));
 if(url.origin==='https://devs.runly.mx'){
  const s=JSON.parse(readFileSync('/fixture/control.json','utf8'));
  if(s.mode==='down')return Response.json({error:'fixture_unavailable'},{status:503});
  if(url.pathname.endsWith('/publishers/runtime-after-build'))return s.appeared?Response.json({schemaVersion:1,publisher:{handle:'runtime-after-build',displayName:'Publicador posterior al build',verified:false,state:s.mode==='gone'?'revoked':'active',memberSince:'2026-11-10T00:00:00.000Z',resourceCount:0,bio:null},items:[]}):Response.json({}, {status:404});
  if(s.mode==='gone'&&url.pathname.includes('/resources/studio_template/'))return Response.json({schemaVersion:1,availability:'revoked',replacement:null},{status:410});
 }
 return original(input,init);
};
`);
writeFileSync(join(output, 'nginx.conf'), `events {}\nhttp { include /etc/nginx/mime.types; server { listen 80; root /fixture/dist/client; index index.html; include /fixture/marketplace-runtime.nginx.conf; location / { try_files $uri $uri/ =404; } } }\n`);
writeFileSync(join(output, 'start.sh'), `set -eu
mkdir -p /app
cp -R /fixture/dist /app/dist
cp /fixture/package.json /fixture/pnpm-lock.yaml /app/
cp /fixture/marketplace-runtime.nginx.conf /app/
cd /app
corepack prepare pnpm@10.14.0 --activate
corepack pnpm install --prod --frozen-lockfile --ignore-scripts --ignore-workspace --config.node-linker=isolated --config.package-import-method=copy
chmod -R go-w,a+rX /app
node -e 'const {spawn}=require("node:child_process");const child=spawn(process.execPath,["dist/server/entry.mjs"],{uid:65534,gid:65534,stdio:"inherit",env:{...process.env,HOST:"127.0.0.1",PORT:"4398",NODE_ENV:"production",NODE_OPTIONS:"--import=/fixture/fixture-fetch.mjs"}});require("node:fs").writeFileSync("/app/node.pid",String(child.pid));child.on("exit",()=>{});' &
sleep infinity
`);
const state = (mode, appeared = true) => writeFileSync(join(output, 'control.json'), JSON.stringify({ mode, appeared }));
let browser;
try {
  docker(['run', '-d', '--name', name, '-p', '127.0.0.1::80', '--mount', `type=bind,src=${output},dst=/fixture,readonly`, 'node:22.22.3-alpine', 'sh', '/fixture/start.sh']);
  let ready = false;
  for (let n = 0; n < 120; n++) {
    try { docker(['exec', name, 'node', '-e', "fetch('http://127.0.0.1:4398/marketplace/publicadores/_probe_/').then(r=>process.exit(r.status===404?0:1)).catch(()=>process.exit(1))"]); ready = true; break; } catch { await new Promise(done => setTimeout(done, 500)); }
  }
  assert.ok(ready, 'production-only artifact must start'); checks.push('Linux production dependencies start Astro as an unprivileged user with read-only application files');
  docker(['exec', name, 'node', '--input-type=module', '-e', "import {probe,artifactDigest,checkDependencyLinks} from '/fixture/scripts/deploy-marketplace.mjs';checkDependencyLinks('/app/node_modules','/app');artifactDigest('/app');await probe('/app')"]);
  checks.push('staged artifact probe succeeds before cutover');
  docker(['run', '-d', '--name', proxy, '--network', `container:${name}`, '--mount', `type=bind,src=${output},dst=/fixture,readonly`, 'nginx:alpine', 'nginx', '-c', '/fixture/nginx.conf', '-g', 'daemon off;']);
  const origin = `http://${docker(['port', name, '80/tcp'])}`;
  const get = async (path, expected) => { const response = await fetch(origin + path); assert.equal(response.status, expected, path); return response; };
  await get('/', 200);
  const publisher = '/marketplace/publicadores/runtime-after-build/', cumbre = '/marketplace/plantillas-studio/cumbre-innovacion-liderazgo-2027/';
  await get(publisher, 404); state('live');
  assert.match(await (await get(publisher, 200)).text(), /Publicador posterior al build/);
  checks.push('new publisher: 404 -> 200 without rebuild or restart');
  await get(cumbre, 200); state('gone'); await get(cumbre, 410); await get(publisher, 410);
  state('down'); await get(cumbre, 503); await get(publisher, 503); await get('/', 200);
  state('live'); checks.push('Nginx preserves Astro 200/404/410/503; static home is independent');
  const hub = 'https://devs.runly.mx', detail = await (await fetch(hub + '/api/v1/marketplace/resources/studio_template/cumbre-innovacion-liderazgo-2027')).json();
  for (const preview of detail.resource.previews) { const r = await fetch(hub + preview.url); assert.equal(r.status, 200); assert.equal(sha(Buffer.from(await r.arrayBuffer())), preview.sha256); }
  const r = await fetch(hub + '/api/v1/marketplace/catalog/resources/packages/' + detail.resource.latest.sha256), bytes = Buffer.from(await r.arrayBuffer());
  assert.equal(r.status, 200); assert.equal(bytes.length, detail.resource.latest.size); assert.equal(sha(bytes), detail.resource.latest.sha256);
  checks.push(`Cumbre: ${detail.resource.previews.length} original previews and ${bytes.length}-byte package match published hashes`);
  if (process.env.RUNLY_PLAYWRIGHT_MODULE) {
    const { chromium } = await import(process.env.RUNLY_PLAYWRIGHT_MODULE);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage(), errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + cumbre);
    await page.getByRole('button', { name: 'Descargar .runlystudio', exact: true }).waitFor();
    await page.locator('[data-provenance] [data-trust="official"]').waitFor({ state: 'visible' });
    const gallery = page.locator('[data-gallery]'); assert.equal(await gallery.getAttribute('data-count'), '2');
    await gallery.locator('img').first().waitFor();
    await page.waitForFunction(() => document.querySelector('[data-gallery] img')?.naturalWidth > 0);
    const waiting = page.waitForEvent('download'); await page.getByRole('button', { name: 'Descargar .runlystudio', exact: true }).click(); const download = await waiting;
    assert.equal(download.suggestedFilename(), 'cumbre-innovacion-liderazgo-2027-1.0.0.runlystudio');
    assert.equal(sha(readFileSync(await download.path())), detail.resource.latest.sha256); assert.deepEqual(errors, []);
    checks.push('Chromium: real gallery image and original .runlystudio download through the public sheet');
  }
  docker(['exec', name, 'sh', '-c', 'kill -TERM "$(cat /app/node.pid)"']);
  const unavailable = await get(cumbre, 503); assert.equal(unavailable.headers.get('x-robots-tag'), 'noindex'); await get('/', 200);
  checks.push('stopped Node: only dynamic routes return Nginx 503/noindex; home stays 200');
  writeFileSync(join(output, 'result.json'), JSON.stringify({ passed: true, checks }, null, 2)); console.log(JSON.stringify({ passed: true, checks }));
} catch (error) {
  writeFileSync(join(output, 'result.json'), JSON.stringify({ passed: false, checks, error: error.message }, null, 2));
  throw error;
} finally {
  await browser?.close();
  for (const container of [proxy, name]) { try { docker(['rm', '-f', container]); } catch { /* only the containers created above */ } }
}
