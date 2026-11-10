# Runly Web — Agent Instructions

## Developer documentation (generated, do not edit)

`src/content/developers/*.md` is a generated copy of `runly/docs/developers/*.md`
(runly-erp), which is the single source for runly.mx, the Builder ZIP and the
Developer Hub MCP docs. Never edit these pages here: change them in runly-erp and
run `node scripts/sync-help-content.mjs`. `.sync-manifest.json` records what was
last synced; the script refuses to run when a page was hand-edited here or exists
only here. After syncing, refresh the Hub with
`node scripts/sync-mcp-docs.mjs ../runly-web` in `../runly-developer-hub`.

Module help (`src/content/help/`) is likewise generated from
`runly/apps/api/src/manifests/official/help` by the same script.

## Module capabilities (generated, do not edit)

`src/data/module-capabilities.json` (the "Lo que puedes hacer" cards and compatibility
chips on every module docs page) is copied from
`runly/apps/api/src/manifests/official/help/capabilities.json` by
`node scripts/sync-help-content.mjs`. Edit it in runly, next to the module help, in the
same change that adds or changes a module feature, then sync. `modules.ts` (the grid)
still lives here and must list every module that has help.
