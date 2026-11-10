// src/lib/scenes.ts  -  progressive enhancement for the home scenes.
// Without JS everything is visible (CSS default --p:1). With JS, and only when
// motion is allowed, desktop scenes get sticky progress and mobile images get
// bounded depth. Blocks reveal once; native scroll is never hijacked.
const root = document.querySelector<HTMLElement>("[data-home-scenes]");

if (root) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 1024px)");
  root.classList.add("js");

  // Tabs (modules + marketplace): roving tabindex, arrows / Home / End.
  root.querySelectorAll<HTMLElement>("[data-tabs]").forEach((group) => {
    group.classList.add("hv2-tabs-on");
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = Array.from(group.querySelectorAll<HTMLElement>("[data-panel]"));
    const select = (i: number, focus = false, animate = true) => {
      tabs.forEach((t, k) => {
        t.setAttribute("aria-selected", String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
      panels.forEach((p, k) => {
        p.getAnimations().forEach((animation) => animation.cancel());
        p.hidden = k !== i;
      });
      if (animate && !reduce.matches) panels[i]?.animate(
        [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
      if (focus) tabs[i].focus();
    };
    select(0, false, false);
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      t.addEventListener("keydown", (e) => {
        const n = tabs.length;
        const keys: Record<string, number> = {
          ArrowDown: (i + 1) % n, ArrowRight: (i + 1) % n,
          ArrowUp: (i + n - 1) % n, ArrowLeft: (i + n - 1) % n,
          Home: 0, End: n - 1,
        };
        if (e.key in keys) { e.preventDefault(); select(keys[e.key], true); }
      });
    });
  });

  // One-shot reveals.
  const ios = Array.from(root.querySelectorAll<HTMLElement>(".io, .hv2-layer"));
  const showAll = () => ios.forEach((el) => el.classList.add("is-in"));
  reduce.addEventListener("change", () => {
    if (reduce.matches) {
      showAll();
      root.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    }
  });
  if (reduce.matches || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    ios.forEach((el) => io.observe(el));
  }

  // Sticky-scene progress (desktop, motion allowed).
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-scene="sticky"]'));
  const depthTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-mobile-parallax]"));
  const visibleDepth = new Set<HTMLElement>();
  const setAll = (v: number) => scenes.forEach((s) => s.style.setProperty("--p", String(v)));
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    scenes.filter((s) => s.classList.contains("hv2-scene-motion")).forEach((s) => {
      const r = s.getBoundingClientRect();
      const range = r.height - vh;
      const p = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 1;
      s.style.setProperty("--p", p.toFixed(3));
    });
    if (!reduce.matches && !desktop.matches) visibleDepth.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (!rect.height || rect.bottom < -100 || rect.top > vh + 100) return;
      const previous = parseFloat(element.style.getPropertyValue("--mobile-y")) || 0;
      const distance = rect.top + rect.height / 2 - previous - vh / 2;
      const density = window.devicePixelRatio || 1;
      const offset = Math.round(Math.max(-18, Math.min(18, distance * 0.055)) * density) / density;
      element.style.setProperty("--mobile-y", `${offset.toFixed(2)}px`);
      element.style.setProperty("--mobile-tilt", `${(offset * 0.025).toFixed(3)}deg`);
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) visibleDepth.add(element);
        else visibleDepth.delete(element);
      });
      onScroll();
    }, { rootMargin: "120px" });
    depthTargets.forEach((element) => observer.observe(element));
  } else depthTargets.forEach((element) => visibleDepth.add(element));
  const sync = () => {
    window.removeEventListener("scroll", onScroll);
    const allowed = !reduce.matches && desktop.matches;
    const mobile = !reduce.matches && !desktop.matches;
    root.classList.toggle("hv2-mobile-motion", mobile);
    if (!mobile) depthTargets.forEach((element) => {
      element.style.removeProperty("--mobile-y");
      element.style.removeProperty("--mobile-tilt");
    });
    let active = mobile;
    scenes.forEach((scene) => {
      if (!allowed) {
        scene.classList.remove("hv2-scene-motion");
        scene.style.setProperty("--p", "1");
        return;
      }
      const pin = scene.querySelector<HTMLElement>(".hv2-pin");
      const content = pin?.firstElementChild as HTMLElement | null;
      const padding = pin ? parseFloat(getComputedStyle(pin).paddingTop) + parseFloat(getComputedStyle(pin).paddingBottom) : 0;
      // Measure the two columns without temporarily enabling sticky layout.
      // The layers stage uses the same 16 / 12.5 ratio as home-v2.css.
      const height = content ? Math.max(...Array.from(content.children).map((column) => {
        const rect = column.getBoundingClientRect();
        return column.classList.contains("hv2-layers") ? rect.width * 12.5 / 16 : rect.height;
      })) : Infinity;
      // Tall text/zoom must remain in normal flow, never clipped in a pinned viewport.
      const fits = allowed && height + padding <= window.innerHeight - 80;
      scene.classList.toggle("hv2-scene-motion", fits);
      if (!fits) scene.style.setProperty("--p", "1");
      active ||= fits;
    });
    root.classList.toggle("hv2-motion", allowed && active);
    if (!active) { setAll(1); return; }
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  };
  reduce.addEventListener("change", sync);
  desktop.addEventListener("change", sync);
  window.addEventListener("resize", sync);
  window.addEventListener("pageshow", sync);
  document.fonts?.ready.then(sync);
  sync();
}
