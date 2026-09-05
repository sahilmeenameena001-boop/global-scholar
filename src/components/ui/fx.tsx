"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useSyncExternalStore } from "react";

const MQ = "(hover: hover) and (pointer: fine)";
const subscribe = (cb: () => void) => { const m = window.matchMedia(MQ); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
/** True only on devices with a real pointer and hover (never on touch). */
export function useFinePointer() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(MQ).matches, () => false);
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Word-by-word masked reveal: each word rises out of a clipped line. Text stays a single string for screen readers. */
export function SplitWords({ text, className = "", delay = 0, inView = false, as: Tag = "span" }: { text: string; className?: string; delay?: number; inView?: boolean; as?: "span" | "h1" | "h2" }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const M = motion[Tag];
  return (
    <M className={className} aria-label={text} {...(inView ? { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-60px" } } : { initial: "hidden", animate: "show" })}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{ hidden: reduce ? {} : { y: "110%", rotate: 3 }, show: { y: 0, rotate: 0, transition: { duration: 0.7, ease: EASE, delay: delay + i * 0.07 } } }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </M>
  );
}

/** 3D tilt that follows the pointer on desktop. Renders a plain div on touch or with reduced motion. */
export function Tilt({ children, className = "", max = 8, glare = true }: { children: React.ReactNode; className?: string; max?: number; glare?: boolean }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 220, damping: 22 });
  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glareBg = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.35), transparent 55%)`);
  const on = fine && !reduce;

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={on ? { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", transformPerspective: 900 } : undefined}
      onPointerMove={on ? (e) => { const r = e.currentTarget.getBoundingClientRect(); px.set((e.clientX - r.left) / r.width); py.set((e.clientY - r.top) / r.height); } : undefined}
      onPointerLeave={on ? () => { px.set(0.5); py.set(0.5); } : undefined}
    >
      {children}
      {on && glare && (
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glareBg }} />
      )}
    </motion.div>
  );
}

/** Magnetic pull toward the cursor for a primary button. */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: React.ReactNode; strength?: number; className?: string }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });
  const on = fine && !reduce;
  return (
    <motion.div
      className={`inline-block ${className}`}
      style={on ? { x: sx, y: sy } : undefined}
      onPointerMove={on ? (e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * strength); y.set((e.clientY - (r.top + r.height / 2)) * strength); } : undefined}
      onPointerLeave={on ? () => { x.set(0); y.set(0); } : undefined}
    >
      {children}
    </motion.div>
  );
}

/** Hand-drawn underline that draws itself in when scrolled into view. */
export function DrawUnderline({ colour = "#F06B5D", className = "" }: { colour?: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className={`block h-3 w-40 ${className}`}>
      <motion.path d="M2 8 Q 50 2, 100 7 T 198 5" fill="none" stroke={colour} strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay: 0.35, ease: "easeInOut" }} />
    </svg>
  );
}

/** Passport-stamp pop: scales down from oversized with a spring, like a stamp landing on paper. */
export function StampIn({ children, className = "", delay = 0, inView = true }: { children: React.ReactNode; className?: string; delay?: number; inView?: boolean }) {
  const reduce = useReducedMotion();
  const anim = { opacity: 1, scale: 1, rotate: -6 };
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={reduce ? anim : { opacity: 0, scale: 2.2, rotate: 8 }}
      {...(inView ? { whileInView: anim, viewport: { once: true, margin: "-40px" } } : { animate: anim })}
      transition={{ type: "spring", stiffness: 420, damping: 16, delay }}
    >
      {children}
    </motion.span>
  );
}
