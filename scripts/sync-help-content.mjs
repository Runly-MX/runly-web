#!/usr/bin/env node
// Copies the module help markdown (overview + per-view articles) from a
// local checkout of the `runly` monorepo into this repo's Astro content
// collection, verbatim — no format transformation. `runly` stays the single
// source of truth for this content (it's edited there, next to each
// module's navigation.path/permissions); this script just brings a copy
// into runly-web's own build.
//
// Manual step, run whenever help content changes in `runly`:
//   node scripts/sync-help-content.mjs [path-to-runly-repo]
// Defaults to "../runly" (this repo's sibling folder in this dev layout).
//
// See docs/superpowers/specs/2026-09-27-public-help-docs-runly-web-design.md
// in the runly repo for the full design.
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseHelpRelativePath } from "./lib/help-content-paths.mjs";
import { extractModuleNavigation } from "./lib/help-navigation.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");

const runlyRepoPath = path.resolve(repoRoot, process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "../runly");
const sourceDir = path.join(runlyRepoPath, "apps/api/src/manifests/official/help");
const destDir = path.join(repoRoot, "src/content/help");

function listMarkdownFilesRecursive(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFilesRecursive(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(path.relative(baseDir, fullPath));
    }
  }
  return files;
}

function main() {
  // Developer-only publication must not rewrite unrelated module help/navigation.
  if (process.argv.includes("--developers-only")) {
    syncDeveloperDocs();
    return;
  }
  if (!fs.existsSync(sourceDir)) {
    console.error(`[sync-help-content] No existe: ${sourceDir}`);
    console.error(
      "[sync-help-content] Pasa la ruta al repo runly como argumento, ej.: node scripts/sync-help-content.mjs /ruta/a/runly",
    );
    process.exitCode = 1;
    return;
  }

  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });

  const relativeFiles = listMarkdownFilesRecursive(sourceDir);
  const moduleKeys = new Set();
  let overviewCount = 0;
  let viewCount = 0;

  for (const relPath of relativeFiles) {
    const parsed = parseHelpRelativePath(relPath);
    if (!parsed) {
      console.warn(`[sync-help-content] Ruta inesperada, se copia igual: ${relPath}`);
    } else {
      moduleKeys.add(parsed.moduleKey);
      if (parsed.kind === "overview") overviewCount += 1;
      if (parsed.kind === "view") viewCount += 1;
    }

    const from = path.join(sourceDir, relPath);
    const to = path.join(destDir, relPath);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }

  console.log(
    `[sync-help-content] ${relativeFiles.length} archivos copiados: ${moduleKeys.size} modulos ` +
      `(${overviewCount} overviews, ${viewCount} vistas).`,
  );
  console.log(`[sync-help-content] Origen: ${sourceDir}`);
  console.log(`[sync-help-content] Destino: ${destDir}`);

  syncNavigation();
  syncDeveloperDocs();
}

// Sidebar navigation (path + icon, in order) of every official module, so the
// docs pages show each view with its in-app icon and in sidebar order.
function syncNavigation() {
  const manifestsDir = path.join(runlyRepoPath, "apps/api/src/manifests/official");
  const source = fs
    .readdirSync(manifestsDir)
    .filter((name) => name.endsWith(".js"))
    .sort()
    .map((name) => fs.readFileSync(path.join(manifestsDir, name), "utf8"))
    .join("\n");
  const navigation = extractModuleNavigation(source);
  const navDest = path.join(repoRoot, "src/data/help-navigation.json");
  fs.writeFileSync(navDest, `${JSON.stringify(navigation, null, 2)}\n`);
  console.log(`[sync-help-content] Navegación de ${Object.keys(navigation).length} módulos escrita en ${navDest}`);
}

// Developer documentation (docs/developers/*.md in the runly repo): published
// at /documentacion/desarrolladores, plus /llms.txt and Markdown copies for AI
// assistants.
//
// SOURCE OF TRUTH: runly/docs/developers. These pages (and the Developer Hub's MCP copy,
// synced from here by runly-developer-hub/scripts/sync-mcp-docs.mjs) are generated copies:
// never edit them in this repo. `.sync-manifest.json` records the hash of every page as
// last synced; the sync refuses to run when a copy no longer matches it (hand-edited
// here) or when a page exists only here, instead of silently losing or keeping a fork.
// Move that change into runly/docs/developers, then sync again.
//   node scripts/sync-help-content.mjs                 mirror runly/docs/developers
//   node scripts/sync-help-content.mjs ../runly --force-dev   overwrite hand edits / drop web-only pages
function syncDeveloperDocs() {
  const devSource = path.join(runlyRepoPath, "docs/developers");
  const devDest = path.join(repoRoot, "src/content/developers");
  if (!fs.existsSync(devSource)) {
    console.warn(`[sync-help-content] No existe ${devSource}; se omite la documentación de desarrolladores.`);
    return;
  }
  fs.mkdirSync(devDest, { recursive: true });
  const force = process.argv.includes("--force-dev");
  const norm = (text) => text.replace(/\r\n/g, "\n");
  const hash = (text) => crypto.createHash("sha256").update(norm(text)).digest("hex");
  const manifestPath = path.join(devDest, ".sync-manifest.json");
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : { files: {} };
  const files = fs.readdirSync(devSource).filter((name) => name.endsWith(".md"));
  const webOnly = fs.readdirSync(devDest).filter((name) => name.endsWith(".md") && !files.includes(name));
  const handEdited = files.filter((name) => {
    const to = path.join(devDest, name);
    const recorded = manifest.files?.[name];
    return recorded && fs.existsSync(to) && hash(fs.readFileSync(to, "utf8")) !== recorded;
  });
  if (!force && (handEdited.length || webOnly.length)) {
    if (handEdited.length) console.error(`[sync-help-content] Editadas a mano aquí (no vienen de runly/docs/developers): ${handEdited.join(", ")}`);
    if (webOnly.length) console.error(`[sync-help-content] Solo existen en la web: ${webOnly.join(", ")}`);
    console.error("[sync-help-content] Pasa esos cambios a runly/docs/developers y vuelve a sincronizar, o usa --force-dev para descartarlos.");
    process.exit(1);
  }
  const added = [], updated = [], same = [];
  const next = {};
  for (const name of files) {
    const text = norm(fs.readFileSync(path.join(devSource, name), "utf8"));
    const to = path.join(devDest, name);
    next[name] = hash(text);
    if (!fs.existsSync(to)) added.push(name);
    else if (norm(fs.readFileSync(to, "utf8")) === text) { same.push(name); continue; }
    else updated.push(name);
    fs.writeFileSync(to, text);
  }
  for (const name of webOnly) fs.rmSync(path.join(devDest, name));
  const revision = execFileSync("git", ["-C", runlyRepoPath, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const dirty = Boolean(execFileSync("git", ["-C", runlyRepoPath, "status", "--porcelain", "--", "docs/developers"], { encoding: "utf8" }).trim());
  fs.writeFileSync(manifestPath, JSON.stringify({ source: "runly/docs/developers", revision, dirty, files: next }, null, 2) + "\n");
  console.log(`[sync-help-content] Desarrolladores: ${added.length} nuevas, ${updated.length} actualizadas, ${same.length} idénticas${webOnly.length ? `, ${webOnly.length} eliminadas (solo web)` : ""}.`);
}

main();
