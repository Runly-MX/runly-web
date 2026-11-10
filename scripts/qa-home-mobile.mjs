// Focused mobile regression checks. Use a local Astro server and existing Playwright.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const base = new URL(process.env.RUNLY_QA_URL || 'http://127.0.0.1:4335');
assert(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname));
const modulePath = process.env.RUNLY_QA_PLAYWRIGHT_MODULE;
const imported = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
const { chromium } = imported.default ?? imported;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const output = '.artifacts/mobile-visual';
await mkdir(output, { recursive: true });
const results = [], errors = [];

async function context(options) {
  const ctx = await browser.newContext(options);
  await ctx.route('**/*', route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
  ctx.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  return ctx;
}
async function settle(page, locator) {
  await locator.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(750);
  await locator.locator('img:visible').evaluateAll(images => Promise.all(images.map(image => image.decode())));
}

try {
  for (const width of [320, 390, 430, 768, 1440]) for (const theme of ['light', 'dark']) for (const locale of ['es', 'en']) {
    const ctx = await context({ viewport: { width, height: width === 1440 ? 1000 : 844 }, deviceScaleFactor: 2, colorScheme: theme });
    const page = await ctx.newPage();
    assert.equal((await page.goto(new URL(locale === 'en' ? '/en/' : '/', base).href)).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector('[data-home-scenes]').classList.contains('js'));
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    const hero = page.locator('.hv2-stack');
    await settle(page, hero);
    if (locale === 'es') await page.screenshot({ path: `${output}/final-${width}-${theme}-hero.png` });

    const illustrations = page.locator(width < 900 ? '.hv2-art-img [data-visual="illustration"]' : '.hv2-net [data-visual="illustration"]');
    assert.equal(await illustrations.count(), 4);
    for (const illustration of await illustrations.all()) {
      await settle(page, illustration);
      const dimensions = await illustration.locator('img:visible').evaluate(image => ({
        actual: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
        source: image.naturalWidth / image.naturalHeight,
        fit: getComputedStyle(image).objectFit,
      }));
      assert.equal(dimensions.fit, 'contain');
      assert(Math.abs(dimensions.actual - dimensions.source) < 0.01, JSON.stringify(dimensions));
    }
    if (locale === 'es') {
      await settle(page, illustrations.nth(2));
      await page.screenshot({ path: `${output}/final-${width}-${theme}-illustration.png` });
      await settle(page, page.locator('#crear'));
      await page.screenshot({ path: `${output}/final-${width}-${theme}-create.png` });
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow: ${width}/${theme}/${locale}`);
    // The original small sources must not be enlarged by the responsive pipeline.
    for (const preview of await page.locator('.hv2-image').all()) {
      const maximum = await preview.evaluate(element => parseFloat(element.style.maxWidth));
      for (const image of await preview.locator('img').all()) {
        const candidates = (await image.getAttribute('srcset') || '').split(',').map(item => Number(item.trim().split(' ').at(-1).replace('w', '')));
        assert(candidates.every(candidate => candidate <= maximum));
      }
    }
    assert.equal(await page.locator('a.hv2-image, .hv2-image-open, [data-home-preview]').count(), 0);
    const company = page.locator('.hv2-company-model');
    await settle(page, company);
    assert.equal(await company.locator('.hv2-company-list li').count(), 2);
    assert.equal(await page.locator('[data-slot="HV2-02"]').count(), 0);
    if (locale === 'es') await company.screenshot({ path: `${output}/final-${width}-${theme}-companies.png` });
    const tabs = page.locator('[data-tabs]').first();
    await tabs.locator('[role="tab"]').first().focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await tabs.locator('[role="tab"]').nth(1).getAttribute('aria-selected'), 'true');
    assert(await tabs.locator('[data-panel]:visible').evaluate(panel => panel.getAnimations().length > 0));

    if (width < 1024) {
      const target = illustrations.nth(2);
      await settle(page, target);
      const before = await target.evaluate(element => parseFloat(element.style.getPropertyValue('--mobile-y')));
      await page.evaluate(() => scrollBy({ top: 120, behavior: 'instant' }));
      await page.waitForTimeout(150);
      const after = await target.evaluate(element => parseFloat(element.style.getPropertyValue('--mobile-y')));
      assert(Number.isFinite(before) && Number.isFinite(after) && before !== after && Math.abs(after) <= 18);
      assert.equal(await page.locator('.hv2-scene-motion').count(), 0);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(50);
      assert.equal(await target.evaluate(element => element.style.getPropertyValue('--mobile-y')), '');
      assert.equal(await page.locator('.hv2-mobile-motion').count(), 0);
      await tabs.locator('[role="tab"]').first().focus();
      await page.keyboard.press('End');
      assert.equal(await tabs.locator('[data-panel]:visible').evaluate(panel => panel.getAnimations().length), 0);
      // System theme changes still update the displayed screenshot.
      const next = theme === 'dark' ? 'light' : 'dark';
      await page.emulateMedia({ colorScheme: next });
      await page.waitForFunction(value => document.documentElement.dataset.theme === value, next);
      assert(await hero.locator(`img.hv2-shot-${next}`).first().isVisible());
      await page.reload();
      await page.waitForFunction(value => document.documentElement.dataset.theme === value, next);
    }
    results.push(`${width}/${theme}/${locale}`);
    console.log(`PASS ${results.at(-1)}`);
    await ctx.close();
  }
  for (const locale of ['es', 'en']) {
    const ctx = await context({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(new URL(locale === 'en' ? '/en/' : '/', base).href);
    for (const image of await page.locator('.hv2-art-img img').all()) {
      await settle(page, image.locator('..'));
      assert.equal(await image.evaluate(element => getComputedStyle(element.closest('article')).opacity), '1');
    }
    assert.equal(await page.locator('[data-tabs] [data-panel][hidden]').count(), 0);
    assert(await page.locator('.hv2-company-model').isVisible());
    await ctx.close();
    results.push(`no-js/${locale}`);
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify({ results, errors }, null, 2));
  console.log(`PASS ${results.length} cases; no page errors`);
} finally {
  await browser.close();
}
