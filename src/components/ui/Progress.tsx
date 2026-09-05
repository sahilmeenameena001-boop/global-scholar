"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Flight-route style step indicator. `current` is zero-based; `total` is the number of steps. */
export function Progress({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  const reduce = useReducedMotion();
  const pct = total > 1 ? (current / (total - 1)) * 100 : 100;
  const hop = { duration: reduce ? 0 : 0.62, ease: EASE };

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-mist">
        <span>Step {Math.min(current + 1, total)} of {total}</span>
        <span aria-hidden>{labels[Math.min(current, total - 1)]}</span>
      </div>
      <div role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={Math.min(current + 1, total)} aria-label="Quiz progress" className="relative mt-3 h-8">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 border-t-2 border-dashed border-white/20" />
        {/* travelled route: scaleX, never width */}
        <motion.div className="absolute inset-x-0 top-1/2 h-0.5 origin-left -translate-y-1/2 bg-royal" initial={false} animate={{ scaleX: pct / 100 }} transition={hop} />
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors ${i <= current ? "border-royal bg-royal" : "border-navy/30 bg-surface"}`} style={{ left: `${(i / (total - 1)) * 100}%` }} />
        ))}
        {/* the plane hops stop to stop, lifting through a small arc on the way */}
        <motion.span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" initial={false} animate={{ left: `${pct}%` }} transition={hop}>
          {/* keyed on `current` so the arc keyframes replay on every hop */}
          <motion.span
            key={current}
            className="grid size-8 place-items-center rounded-full bg-navy text-white shadow-card"
            animate={reduce ? { y: 0, rotate: 0 } : { y: [0, -13, 0], rotate: [0, -9, 0] }}
            transition={hop}
          >
            <Plane aria-hidden className="size-4 rotate-45" />
          </motion.span>
        </motion.span>
      </div>
    </div>
  );
}
