"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, SplitText, TIER } from "@/lib/gsap";
import { useFontsReady } from "@/lib/useFontsReady";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Tag = "h1" | "h2" | "h3" | "p" | "div";

/**
 * Masked line-by-line reveal. Splits only after fonts settle so lines break correctly,
 * and SplitText's aria handling keeps the original string readable to screen readers.
 */
export function Headline({
  children, as: Tag = "h2", className = "", delay = 0, onLoad = false,
}: { children: string; as?: Tag; className?: string; delay?: number; onLoad?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const fonts = useFontsReady();
  const reduce = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    // reduced motion, or JS-less: the text is simply there
    if (reduce) { gsap.set(el, { autoAlpha: 1 }); return; }
    // hide before first paint, but only once we know GSAP is running
    if (!fonts) { gsap.set(el, { autoAlpha: 0 }); return; }

    const split = SplitText.create(el, { type: "lines", mask: "lines", autoSplit: true, aria: "auto" });
    gsap.set(el, { autoAlpha: 1 });
    const tween = gsap.from(split.lines, {
      yPercent: 110,
      duration: TIER.display.duration,
      ease: TIER.display.ease,
      stagger: TIER.display.stagger,
      delay,
      ...(onLoad ? {} : { scrollTrigger: { trigger: el, start: TIER.display.start, once: true } }),
    });
    return () => { tween.kill(); split.revert(); };
  }, { scope: ref, dependencies: [fonts, reduce, delay, onLoad] });

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}

/** Standard-tier staggered entrance for a group of children. */
export function Reveal({
  children, className = "", stagger = TIER.standard.stagger, y = TIER.standard.y, start = TIER.standard.start,
}: { children: React.ReactNode; className?: string; stagger?: number; y?: number; start?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const kids = Array.from(el.children);
    if (!kids.length) return;
    if (reduce) { gsap.set(kids, { opacity: 1, y: 0 }); return; }
    gsap.from(kids, {
      opacity: 0, y, duration: TIER.standard.duration, ease: TIER.standard.ease,
      stagger: Math.min(stagger, 0.08),
      scrollTrigger: { trigger: el, start, once: true },
    });
  }, { scope: ref, dependencies: [reduce, stagger, y, start] });

  return <div ref={ref} className={className}>{children}</div>;
}

/** Clip wipe + counter-scale — the highest-leverage "expensive" reveal for media. */
export function ClipReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const inner = el.firstElementChild;
    if (reduce || !inner) return;
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } })
      .fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.out" })
      .fromTo(inner, { scale: 1.2 }, { scale: 1, duration: 1.4, ease: "power3.out" }, 0);
  }, { scope: ref, dependencies: [reduce] });

  return <div ref={ref} className={className}>{children}</div>;
}

/** Subtle depth offset. Percentages only — never top/margin. */
export function Parallax({
  children, speed = 0.3, className = "",
}: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      gsap.fromTo(el, { yPercent: -speed * 12 }, {
        yPercent: speed * 12, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, { scope: ref, dependencies: [reduce, speed] });

  return <div ref={ref} className={className}>{children}</div>;
}
