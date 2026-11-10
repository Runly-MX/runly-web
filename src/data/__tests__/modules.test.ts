// src/data/__tests__/modules.test.ts
import { describe, expect, it } from "vitest";
import { modules, moduleCategories } from "../modules";

describe("modules catalog", () => {
  it("has exactly 27 real Runly modules", () => {
    expect(modules).toHaveLength(27);
  });

  it("every module has an ES and EN name and description", () => {
    for (const mod of modules) {
      expect(mod.name.es.length).toBeGreaterThan(0);
      expect(mod.name.en.length).toBeGreaterThan(0);
      expect(mod.description.es.length).toBeGreaterThan(0);
      expect(mod.description.en.length).toBeGreaterThan(0);
    }
  });

  it("does not list a MirAI entry as its own module", () => {
    expect(modules.find((m) => m.id === "runly.mirai")).toBeUndefined();
  });

  it("every module category exists in moduleCategories", () => {
    const categoryIds = new Set(moduleCategories.map((c) => c.id));
    for (const mod of modules) {
      expect(categoryIds.has(mod.category)).toBe(true);
    }
  });
});

// Icon-name validity for modules/roadmap is covered by
// src/lib/__tests__/icons.test.ts, alongside every other section that
// resolves icon names dynamically at runtime.

describe("module capabilities", () => {
  it("covers every module with real icons", async () => {
    const moduleCapabilities = (await import("../module-capabilities.json")).default as Record<string, { highlights: { icon: string }[] }>;
    const Icons = await import("@lucide/astro");
    const bad: string[] = [];
    for (const mod of modules) {
      const caps = moduleCapabilities[mod.id];
      if (!caps) { bad.push(`${mod.id}: missing`); continue; }
      for (const c of caps.highlights) if (!(c.icon in Icons)) bad.push(`${mod.id}: ${c.icon}`);
    }
    for (const mod of modules) if (!(mod.icon in Icons)) bad.push(`${mod.id} icon ${mod.icon}`);
    expect(bad).toEqual([]);
  }, 60000);
});
