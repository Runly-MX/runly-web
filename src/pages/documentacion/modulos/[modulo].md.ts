// /documentacion/modulos/<modulo>.md — the module's help pages as one Markdown
// file (overview + every view), for "copy as Markdown" and AI assistants.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getDocsCatalog } from "../../../lib/docs-content";
import { SITE_URL } from "../../../lib/developer-docs";

export const prerender = true;

export async function getStaticPaths() {
  const catalog = await getDocsCatalog();
  return catalog.map((mod) => ({ params: { modulo: mod.moduleKey }, props: { moduleKey: mod.moduleKey } }));
}

const absolutize = (md: string) => md.replace(/\]\((\/[^)]+)\)/g, (_m, href) => `](${SITE_URL}${href})`);

export const GET: APIRoute = async ({ props }) => {
  const { moduleKey } = props as { moduleKey: string };
  const mod = (await getDocsCatalog()).find((m) => m.moduleKey === moduleKey)!;
  const entries = await getCollection("help", (e) => e.id.startsWith(`${moduleKey}/`));
  const overview = entries.find((e) => e.id === `${moduleKey}/overview`);
  const parts = [`# ${mod.name}`, mod.summary ? `> ${mod.summary}` : "", overview?.body?.trim() ?? ""];
  for (const view of mod.views) {
    const entry = entries.find((e) => e.id === `${moduleKey}/views/${view.slug}`);
    if (entry) parts.push(`## ${view.title}`, entry.body?.trim() ?? "");
  }
  return new Response(absolutize(parts.filter(Boolean).join("\n\n")) + "\n", { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
