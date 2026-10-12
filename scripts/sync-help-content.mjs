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
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseHelpRelativePath } from "./lib/help-content-paths.mjs";
import { extractModuleNavigation } from "./lib/help-navigation.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");

const runlyRepoPath = path.resolve(repoRoot, process.argv[2] ?? "../runly");
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
// NON-DESTRUCTIVE on purpose: some pages (MCP, community catalog, edited front matter)
// live only in this repo. The sync never deletes a page, never overwrites a page that
// differs from the runly copy unless asked, and reports both cases:
//   node scripts/sync-help-content.mjs                 new pages are added, identical ones skipped
//   node scripts/sync-help-content.mjs --force-dev=componentes.md,librerias.md
//   node scripts/sync-help-content.mjs --force-dev     overwrite every differing page
function syncDeveloperDocs() {
  const devSource = path.join(runlyRepoPath, "docs/developers");
  const devDest = path.join(repoRoot, "src/content/developers");
  if (!fs.existsSync(devSource)) {
    console.warn(`[sync-help-content] No existe ${devSource}; se omite la documentación de desarrolladores.`);
    return;
  }
  fs.mkdirSync(devDest, { recursive: true });
  const forceArg = process.argv.find((arg) => arg === "--force-dev" || arg.startsWith("--force-dev="));
  const forceAll = forceArg === "--force-dev";
  const forced = new Set(forceArg?.includes("=") ? forceArg.split("=")[1].split(",").map((n) => n.trim()).filter(Boolean) : []);
  const norm = (text) => text.replace(/\r\n/g, "\n");
  const files = fs.readdirSync(devSource).filter((name) => name.endsWith(".md"));
  const added = [], updated = [], same = [], diverged = [];
  for (const name of files) {
    const from = path.join(devSource, name);
    const to = path.join(devDest, name);
    if (!fs.existsSync(to)) { fs.copyFileSync(from, to); added.push(name); continue; }
    if (norm(fs.readFileSync(from, "utf8")) === norm(fs.readFileSync(to, "utf8"))) { same.push(name); continue; }
    if (forceAll || forced.has(name)) { fs.copyFileSync(from, to); updated.push(name); continue; }
    diverged.push(name);
  }
  const webOnly = fs.readdirSync(devDest).filter((name) => name.endsWith(".md") && !files.includes(name));
  console.log(`[sync-help-content] Desarrolladores: ${added.length} nuevas, ${updated.length} actualizadas, ${same.length} idénticas.`);
  if (diverged.length) console.warn(`[sync-help-content] ${diverged.length} páginas difieren y NO se sobrescribieron (revisa y usa --force-dev=nombre.md): ${diverged.join(", ")}`);
  if (webOnly.length) console.log(`[sync-help-content] Páginas que solo existen en la web (se conservan): ${webOnly.join(", ")}`);
}

main();
