// scripts/marketplace-feed-check.mjs
//
// Should the static Marketplace be rebuilt? Compares the feed sequence the
// build used (dist/marketplace/catalog-build.json) with the Hub's current one
// (GET /api/v1/marketplace/resources -> feed.sequence). It only REPORTS: no
// build, no deploy. A withdrawn or revoked resource keeps its built page until
// the next build (the page itself checks the Hub at load time).
//
//   node scripts/marketplace-feed-check.mjs [--build dist] [--hub https://devs.runly.mx]
//   exit 0 up-to-date | 10 rebuild-required | 20 hub-unavailable | 30 no-build-marker
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function decideRebuild(built, current) {
  if (!built || built.schemaVersion !== 1) return { status: "no-build-marker", exitCode: 30 };
  if (!current) return { status: "hub-unavailable", exitCode: 20 };
  const was = Number.isSafeInteger(built.feed?.sequence) ? built.feed.sequence : 0;
  const now = Number.isSafeInteger(current.sequence) ? current.sequence : 0;
  // A build made while the Hub was unreachable is always stale once the Hub answers.
  if (built.status !== "ok" || now !== was) return { status: "rebuild-required", exitCode: 10, built: was, current: now };
  return { status: "up-to-date", exitCode: 0, built: was, current: now };
}

async function main(argv) {
  const arg = (name, fallback) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : fallback; };
  const dist = resolve(arg("build", "dist"));
  const hub = new URL(arg("hub", process.env.PUBLIC_RUNLY_HUB_URL || "https://devs.runly.mx")).origin;
  const built = await readFile(resolve(dist, "marketplace", "catalog-build.json"), "utf8").then(JSON.parse).catch(() => null);
  let current = null;
  try {
    const response = await fetch(`${hub}/api/v1/marketplace/resources?limit=1`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) });
    const body = response.ok ? await response.json() : null;
    // An empty Hub catalog has no feed yet: sequence 0.
    if (body?.schemaVersion === 1) current = { sequence: body.feed?.sequence ?? 0 };
  } catch { /* hub-unavailable */ }
  const decision = decideRebuild(built, current);
  console.log(JSON.stringify(decision));
  return decision.exitCode;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
