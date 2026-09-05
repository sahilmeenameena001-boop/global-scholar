"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { motion, useAnimationFrame, useInView, useMotionValue } from "framer-motion";
import { useRef, useState } from "react";

const SPEED = 44; // px per second at full tilt

/**
 * Destination ticker. Runs at constant velocity (no linear easing curve) and
 * spring-ramps to a stop on hover or focus. Frozen off screen and with reduced motion.
 */
export function Ticker({ items, label, className = "" }: { items: string[]; label: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const inView = useInView(wrap, { amount: 0.1 });
  const reduce = useReducedMotion();
  const [held, setHeld] = useState(false);
  const x = useMotionValue(0);
  const vel = useRef(0);

  useAnimationFrame((_, delta) => {
    const w = strip.current?.offsetWidth ?? 0;
    if (!w || reduce || !inView) return;
    const d = Math.min(delta, 50);
    vel.current += ((held ? 0 : SPEED) - vel.current) * Math.min(1, d / 240);
    if (Math.abs(vel.current) < 0.01) return;
    let next = x.get() - (vel.current * d) / 1000;
    if (next <= -w) next += w;
    x.set(next);
  });

  const row = (ref?: React.Ref<HTMLUListElement>, clone = false) => (
    <ul ref={ref} {...(clone ? { "aria-hidden": true } : { "aria-label": label })} className="flex shrink-0 items-center gap-x-9 pr-9">
      {items.map((city, i) => (
        <li key={`${city}-${i}`} className="flex items-center gap-x-9 whitespace-nowrap text-sm font-medium text-mist">
          {city}
          <span aria-hidden className="size-1 shrink-0 rounded-full bg-coral" />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={wrap}
      className={`relative overflow-hidden [mask-image:linear-gradient(90deg,transparent_0,black_20%,black_80%,transparent_100%)] ${className}`}
      onPointerEnter={(e) => { if (e.pointerType !== "touch") setHeld(true); }}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      {reduce ? (
        <div className="flex">{row()}</div>
      ) : (
        <motion.div className="flex w-max" style={{ x }}>
          {row(strip)}
          {row(undefined, true)}
        </motion.div>
      )}
    </div>
  );
}
