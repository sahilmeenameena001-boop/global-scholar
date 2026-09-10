"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { anchorTop, getLenis } from "@/lib/lenis";

/**
 * Lenis owns the scroll position and survives navigation, so a route change
 * would otherwise land the next page at the old offset. Reset it here — jumping
 * to the hash when the link carried one — and refresh ScrollTrigger, whose
 * measurements all belong to the page that just unmounted.
 */
export function RouteScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    const top = target ? anchorTop(target) : 0;

    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { immediate: true });
    else window.scrollTo({ top, behavior: "instant" as ScrollBehavior });

    // triggers are re-created by the incoming page; positions must be re-measured
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
