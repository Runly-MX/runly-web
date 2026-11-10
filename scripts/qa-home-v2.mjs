// Browser acceptance checks against a local preview. Uses an existing Playwright
// installation (or RUNLY_QA_PLAYWRIGHT_MODULE); never submits to a real backend.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const base = new URL(process.env.RUNLY_QA_URL || 'http://127.0.0.1:4322');
assert(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'Use a local preview');
const modulePath = process.env.RUNLY_QA_PLAYWRIGHT_MODULE;
const playwright = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
const { chromium } = playwright.default ?? playwright;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const output = '.artifacts/home-v2-qa';
await mkdir(output, { recursive: true });
const results = [], errors = [], responses = [], accessibility = [], startupCLS = [];
let failSubmission = false;
const submissions = [];

async function context(options = {}) {
  const ctx = await browser.newContext(options);
  await ctx.route('**/*', async (route) => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== base.origin) return route.abort();
    if (url.pathname.startsWith('/__qa-api/')) {
      if (request.method() === 'POST' && url.pathname.includes('submission')) {
        submissions.push(request.postDataJSON());
        return route.fulfill({ status: failSubmission ? 500 : 201, json: failSubmission ? { error: 'QA_ONLY' } : { data: { id: 'qa-submission' } } });
      }
      return route.fulfill({ status: 200, json: { data: { available: false } } });
    }
    return route.continue();
  });
  ctx.on('page', (page) => {
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => { if (r.status() === 404 && new URL(r.url()).origin === base.origin) responses.push(new URL(r.url()).pathname); });
  });
  return ctx;
}
async function visit(page, path = '/') {
  const response = await page.goto(new URL(path, base).href);
  assert.equal(response.status(), 200, path);
  await page.evaluate(() => document.fonts.ready);
}
async function shot(page, name) {
  await page.screenshot({ path: `${output}/${name}.png`, animations: 'disabled', timeout: 10000 });
}
async function reveal(page) {
  await page.evaluate(async () => {
    for (const el of document.querySelectorAll('.io, .reveal-on-scroll')) {
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
  });
}
async function theme(page, expected) {
  await page.waitForFunction((value) => document.documentElement.dataset.theme === value, expected);
}
async function check(name, run) {
  if (process.env.RUNLY_QA_FILTER && !process.env.RUNLY_QA_FILTER.toLowerCase().split('|').some((part) => name.toLowerCase().includes(part))) return;
  await run(); results.push(name); console.log(`PASS ${name}`);
}

try {
  await check('ES/EN, desktop/tablet/mobile, both themes, assets and anchors', async () => {
    for (const width of [390, 768, 1440]) for (const colorScheme of ['light', 'dark']) for (const locale of ['es', 'en']) {
      const ctx = await context({ viewport: { width, height: width === 1440 ? 1000 : 844 }, colorScheme });
      const page = await ctx.newPage(); await visit(page, locale === 'es' ? '/' : '/en/'); await theme(page, colorScheme);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://runly.mx/${locale === 'en' ? 'en/' : ''}`);
      assert((await page.title()).includes(locale === 'es' ? 'Tu operación' : 'Your operations'));
      for (const id of ['hero', 'acerca-de', 'modulos', 'crear', 'ia', 'extender', 'marketplace', 'implementacion', 'contacto']) assert.equal(await page.locator(`#${id}`).count(), 1, id);
      await page.locator('.hv2-tab').first().focus();
      await page.keyboard.press('End'); assert.equal(await page.locator('#hv2-tab-administracion').getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator('#hv2-panel-administracion img').count(), 1);
      await page.keyboard.press('Home'); assert.equal(await page.locator('#hv2-tab-operaciones').getAttribute('aria-selected'), 'true');
      await reveal(page);
      if (process.env.RUNLY_QA_AXE_PATH && locale === 'es' && width !== 768) {
        await page.waitForTimeout(750);
        await page.addScriptTag({ path: process.env.RUNLY_QA_AXE_PATH });
        const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })).violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target, decorative: typeof n.target[0] === 'string' && document.querySelector(n.target[0])?.getAttribute('aria-hidden') === 'true', failureSummary: n.failureSummary })) })));
        accessibility.push({ width, colorScheme, violations });
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow ${locale}/${width}`);
      assert.equal(await page.locator('img').evaluateAll((imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).length), 0);
      if (locale === 'en') assert.equal(await page.locator('.hv2').getByText('Captura en preparación', { exact: false }).count(), 0);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await shot(page, `after-${locale}-${width}-${colorScheme}`);
      if (locale === 'es' && width !== 768) {
        for (const id of ['acerca-de', 'crear', 'ia', 'contacto']) {
          await page.locator(`#${id}`).scrollIntoViewIfNeeded();
          await shot(page, `after-${width}-${colorScheme}-${id}`);
        }
      }
      await ctx.close();
    }
  });
  await check('Desktop startup CLS stays within budget before any user input', async () => {
    for (const locale of ['es', 'en']) {
      const ctx = await context({ viewport: { width: 1350, height: 940 }, colorScheme: 'dark' });
      await ctx.addInitScript(() => {
        window.qaShifts = [];
        new PerformanceObserver((list) => window.qaShifts.push(...list.getEntries().filter((e) => !e.hadRecentInput).map((e) => e.value))).observe({ type: 'layout-shift', buffered: true });
      });
      const page = await ctx.newPage(); await visit(page, locale === 'es' ? '/' : '/en/'); await page.waitForTimeout(2200);
      const value = await page.evaluate(() => window.qaShifts.reduce((sum, v) => sum + v, 0));
      startupCLS.push({ locale, value }); assert(value <= .1, `startup CLS ${locale}: ${value}`); await ctx.close();
    }
  });
  await check('Theme: system, manual, reload, navigation, back, cross-tab and blocked storage', async () => {
    const ctx = await context({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' });
    const page = await ctx.newPage(); await visit(page); await theme(page, 'dark');
    await page.locator('[data-theme-cycle]').click(); await theme(page, 'light');
    await page.reload(); await theme(page, 'light'); await visit(page, '/modulos/'); await theme(page, 'light');
    await page.goBack(); await theme(page, 'light');
    await page.locator('[data-theme-cycle]').click(); await theme(page, 'dark');
    await page.locator('[data-theme-cycle]').click(); assert.equal(await page.locator('html').getAttribute('data-theme-pref'), 'system');
    await page.emulateMedia({ colorScheme: 'light' }); await theme(page, 'light');
    const other = await ctx.newPage(); await visit(other); await other.evaluate(() => localStorage.setItem('runly.theme', 'dark')); await theme(page, 'dark');
    await ctx.close();
    const blocked = await context({ colorScheme: 'dark' });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage blocked'); } }));
    const p = await blocked.newPage();
    await p.route('**/*.js', (route) => route.abort()); // inline head alone must select system before hydration
    await visit(p); await theme(p, 'dark'); await blocked.close();
  });
  await check('Mobile drawer at page bottom, focus containment, submenu and theme', async () => {
    const ctx = await context({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); await visit(p);
    await p.locator('#contacto').scrollIntoViewIfNeeded(); await p.locator('#mobileMenuBtn').click();
    await p.waitForFunction(() => Math.round(document.getElementById('mobileMenu').getBoundingClientRect().top) === 80);
    assert.equal(await p.locator('#mobileMenu').evaluate((e) => Math.round(e.getBoundingClientRect().top)), 80);
    await p.locator('#mobileMenu [data-open-level=product]').click(); await p.keyboard.press('Escape');
    await p.locator('#mobileMenu [data-value=dark]').click(); await theme(p, 'dark');
    for (let i = 0; i < 16; i++) { await p.keyboard.press('Tab'); assert(await p.evaluate(() => !!document.activeElement.closest('header'))); }
    await shot(p, 'after-mobile-menu-dark'); await p.keyboard.press('Escape');
    assert.equal(await p.locator('#mobileMenuBtn').getAttribute('aria-expanded'), 'false');
    assert.equal(await p.locator('#mobileMenu').evaluate((e) => e.inert), true); await ctx.close();
  });
  await check('Reduced motion, live preference changes, small desktop and no IntersectionObserver', async () => {
    const ctx = await context({ viewport: { width: 1440, height: 1400 } }); const p = await ctx.newPage(); await visit(p);
    assert(await p.locator('.hv2-scene-motion').count() > 0);
    const scene = p.locator('#crear');
    const progress = async (fraction) => {
      await scene.evaluate((e, f) => scrollTo({ top: scrollY + e.getBoundingClientRect().top + (e.offsetHeight - innerHeight) * f, behavior: 'instant' }), fraction);
      await p.waitForFunction((f) => Math.abs(Number(document.getElementById('crear').style.getPropertyValue('--p')) - f) < .03, fraction);
      return Number(await scene.evaluate((e) => e.style.getPropertyValue('--p')));
    };
    const forward = await progress(.8), backward = await progress(.2); assert(forward > backward);
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.waitForFunction(() => !document.querySelector('.hv2-scene-motion'));
    assert.equal(await p.locator('.hv2-scene-motion').count(), 0);
    await p.waitForFunction(() => [...document.querySelectorAll('[data-parallax]')].every((e) => !e.style.transform));
    assert.equal(await p.locator('html').evaluate((e) => getComputedStyle(e).scrollBehavior), 'auto');
    await p.emulateMedia({ reducedMotion: 'no-preference' }); assert.equal(await p.locator('.io:not(.is-in)').count(), 0);
    await p.setViewportSize({ width: 1024, height: 600 }); await p.waitForTimeout(100); assert.equal(await p.locator('#acerca-de.hv2-scene-motion').count(), 0);
    await ctx.close();
    const legacy = await context(); await legacy.addInitScript(() => { delete window.IntersectionObserver; });
    const q = await legacy.newPage(); await visit(q); assert.equal(await q.locator('.io:not(.is-in)').count(), 0); await legacy.close();
  });
  await check('No JavaScript: readable FAQ, scenes, navigation and no form URL leakage', async () => {
    const ctx = await context({ javaScriptEnabled: false }); const p = await ctx.newPage(); await visit(p);
    assert(await p.locator('.faq-content').first().isVisible()); assert(await p.locator('.bento-stagger').first().isVisible());
    assert(await p.locator('.bento-stagger > *').evaluateAll((els) => els.every((e) => getComputedStyle(e).opacity === '1')));
    assert(await p.locator('#submitBtn').isDisabled()); assert(await p.getByRole('navigation', { name: 'Navegación sin JavaScript' }).isVisible());
    await p.locator('#fullName').fill('Persona Demo'); await p.locator('#companyName').fill('Empresa Demo');
    await p.locator('#email').fill('qa@example.test'); await p.locator('#phone').fill('0000000000');
    await p.locator('#needs').fill('Prueba sin JavaScript');
    await p.locator('[name=consent]').focus(); await p.keyboard.press('Space');
    await p.locator('#fullName').press('Enter'); assert.equal(new URL(p.url()).search, '');
    await shot(p, 'after-no-js'); await ctx.close();
  });
  await check('Contact success/error/retry: mocked backend only, mapping and reset', async () => {
    const ctx = await context(); const p = await ctx.newPage(); await visit(p);
    assert.equal(await p.locator('#contactForm').getAttribute('data-form-id'), 'qa-contact', 'Build with synthetic QA form configuration');
    const fill = async () => {
      await p.locator('#fullName').fill('Persona Demo'); await p.locator('#companyName').fill('Empresa Demo');
      await p.locator('#email').fill('qa@example.test'); await p.locator('#phone').fill('0000000000');
      await p.locator('#needs').fill('Prueba local de formulario'); await p.locator('[name=consent]').check();
    };
    failSubmission = true; await fill(); await p.locator('#submitBtn').click(); await p.locator('#formError').waitFor({ state: 'visible' });
    assert(await p.locator('#submitBtn').isEnabled()); failSubmission = false; await p.locator('#submitBtn').click();
    await p.locator('#formSuccess').waitFor({ state: 'visible' }); assert.equal(await p.locator('#fullName').inputValue(), '');
    assert.equal(submissions.length, 2); assert(JSON.stringify(submissions[1]).includes('qa@example.test'));
    assert(JSON.stringify(submissions[1]).includes('"fullname":"Persona Demo"'));
    assert(JSON.stringify(submissions[1]).includes('"locale":"es"'));
    await ctx.close();
  });
  await check('Shared pages and homepage internal route targets', async () => {
    const ctx = await context({ colorScheme: 'dark' }); const p = await ctx.newPage(); await visit(p);
    const links = await p.locator('a[href]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('href')).filter((v) => v.startsWith('/')))]);
    for (const href of links) {
      const url = new URL(href, base); const response = await ctx.request.get(url.href); assert.equal(response.status(), 200, href);
      if (url.hash) { const html = await response.text(); assert(html.includes(`id="${url.hash.slice(1)}"`), href); }
    }
    for (const path of ['/modulos/', '/en/modulos/', '/mirai/', '/en/mirai/', '/arquitectura/', '/en/arquitectura/', '/marketplace/', '/runly-developer/', '/documentacion/modulos/', '/documentacion/desarrolladores/', '/privacy/', '/terms/', '/support/']) {
      await visit(p, path); assert(await p.locator('main').count() > 0, path); assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path);
    }
    await ctx.close();
  });
  assert.deepEqual(errors, [], 'Browser exceptions'); assert.deepEqual([...new Set(responses)], [], 'Broken local resources');
  const actionable = accessibility.flatMap((v) => v.violations.flatMap((rule) => rule.nodes.filter((n) => !(rule.id === 'color-contrast' && n.decorative))));
  assert.deepEqual(actionable, [], 'Automated WCAG A/AA findings on functional content (decorative flags retained in JSON)');
} finally {
  await writeFile(`${output}/browser-results${process.env.RUNLY_QA_FILTER ? '-targeted' : ''}.json`, JSON.stringify({ browserVersion: browser.version(), completed: results, errors, missing: [...new Set(responses)], accessibility, startupCLS }, null, 2));
  await browser.close();
}
