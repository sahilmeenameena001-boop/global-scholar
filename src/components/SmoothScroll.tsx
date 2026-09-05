"use client";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useFinePointer } from "./ui/fx";

/** Lenis and ScrollTrigger must share one update loop or scroll animation drifts. */
function LenisBridge() {
  const lenis = useLenis(() => ScrollTrigger.update());
  useEffect(() => {
    if (!lenis) return;
    const raf = (time: number) => lenis.raf(time * 1000);
    (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(raf); };
  }, [lenis]);
  return null;
}

/**
 * Smooth scroll on desktop pointers only. Under reduced motion or on touch the
 * options collapse to native behaviour rather than unmounting, so the tree is stable.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const on = fine && !reduce;
  return (
    <ReactLenis
      root
      options={on ? { lerp: 0.1, smoothWheel: true } : { lerp: 1, smoothWheel: false, syncTouch: false }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
