"use client";
import { anchorTop, getLenis } from "@/lib/lenis";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useEffect } from "react";

/** Anchor navigation routed through Lenis when it is running, so the chapter rail eases to each stop. */
export function SmoothAnchors() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;

      e.preventDefault();
      const focus = () => {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        history.replaceState(null, "", hash);
      };

      const top = hash === "#top" ? 0 : anchorTop(target);
      const lenis = getLenis();

      if (reduce) {
        window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
        focus();
      } else if (lenis) {
        lenis.scrollTo(top, { duration: 1.1 });
        window.setTimeout(focus, 1150);
      } else {
        window.scrollTo({ top, behavior: "smooth" });
        window.setTimeout(focus, 700);
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reduce]);

  return null;
}
