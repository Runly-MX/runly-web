// Marks `.mk-reveal` children as visible once they scroll into view (CSS does the animation).
import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement>(dep: unknown = 0) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nodes = root.querySelectorAll<HTMLElement>(".mk-reveal");
    if (!("IntersectionObserver" in window)) { nodes.forEach((n) => n.setAttribute("data-in", "true")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-in", "true"); io.unobserve(e.target); } }), { threshold: 0.15 });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [dep]);
  return ref;
}
