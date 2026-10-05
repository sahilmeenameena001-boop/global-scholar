"use client";
import { AnimatePresence, motion, useTransform, type MotionValue, type Transition } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import type { MotionProfile, Point, SceneItem } from "@/lib/journey/types";
import { ThoughtArt } from "./ThoughtArt";

/**
 * Each stage's temperament. Drift is loose and floaty, snap lands hard,
 * pipeline moves at a steady machine pace, settle is slow and calm.
 */
const MOVE: Record<MotionProfile, Transition> = {
  drift: { type: "spring", stiffness: 55, damping: 12, mass: 1.1 },
  snap: { type: "spring", stiffness: 420, damping: 28 },
  pipeline: { type: "tween", duration: 0.85, ease: [0.65, 0, 0.35, 1] },
  settle: { type: "spring", stiffness: 70, damping: 20 },
};

/** Stable per-id pseudo-random numbers, so drift differs per object but never between renders. */
function seed(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  const r = (n: number) => (((h >>> (n * 4)) & 0xff) / 255) * 2 - 1;
  return { dx: r(0), dy: r(1), dr: r(2), t: (r(3) + 1) / 2 };
}

type Size = { w: number; h: number };
const CENTRE: Point = { x: 50, y: 50 };

function Thought({
  item, size, lg, profile, index, mx, my, origin,
}: { item: SceneItem; size: Size; lg: boolean; profile: MotionProfile; index: number; mx: MotionValue<number>; my: MotionValue<number>; origin: Point }) {
  const p = lg && item.lg ? item.lg : item.at;
  const depth = item.depth ?? 0.5;
  const px = useTransform(mx, (v) => v * depth * 22);
  const py = useTransform(my, (v) => v * depth * 16);
  const s = seed(item.id);
  const born = { x: (origin.x / 100) * size.w, y: (origin.y / 100) * size.h };
  const scale = (item.scale ?? 1) * (item.focus ? 1.08 : 1) * (item.dim ? 0.86 : 1);

  // idle drift amplitude per temperament; settled thoughts only breathe
  const amp = item.still ? 0 : profile === "drift" ? 1 : profile === "pipeline" ? 0.25 : 0.4;
  const drift = {
    "--dx": `${(s.dx * 9 * amp).toFixed(1)}px`,
    "--dy": `${(s.dy * 11 * amp).toFixed(1)}px`,
    "--dr": `${(s.dr * 3 * amp).toFixed(2)}deg`,
    animation: amp
      ? `thought-drift ${(7 + s.t * 6).toFixed(1)}s ease-in-out ${(-s.t * 8).toFixed(1)}s infinite`
      : item.pulse ? "thought-pulse 2.2s ease-in-out infinite" : undefined,
  } as React.CSSProperties;

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ zIndex: item.focus ? 40 : item.dim ? 5 : 10 + Math.round(depth * 20) }}
      initial={{ x: born.x, y: born.y, scale: 0.2, rotate: 0, opacity: 0 }}
      animate={{ x: (p.x / 100) * size.w, y: (p.y / 100) * size.h, scale, rotate: item.rotate ?? 0, opacity: item.dim ? 0.38 : 1 }}
      exit={{ x: born.x, y: born.y, scale: 0.2, rotate: 0, opacity: 0, transition: { duration: 0.45, ease: [0.55, 0, 0.75, 0.2] } }}
      transition={{ ...MOVE[profile], delay: Math.min(index * 0.035, 0.5), opacity: { duration: 0.35 } }}
    >
      <motion.div style={{ x: px, y: py }}>
        <div className="-translate-x-1/2 -translate-y-1/2">
          <div style={drift} className={item.focus ? "drop-shadow-[0_18px_30px_rgba(36,87,245,0.35)]" : undefined}>
            <ThoughtArt art={item.art} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Renders whatever thoughts the scene composer returns. Positions are
 * percentages of the canvas, converted to pixels from a measured size so every
 * move is a transform — nothing here triggers layout.
 *
 * Decorative by design (aria-hidden): the prompt, options and answer pins carry
 * the same information as text.
 */
export function ThoughtCanvas({
  items, lg, profile, mx, my, origin = CENTRE,
}: {
  items: SceneItem[]; lg: boolean; profile: MotionProfile; mx: MotionValue<number>; my: MotionValue<number>;
  /** Where thoughts are born and return to, in percent of the canvas. */
  origin?: Point;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visible = items.filter((i) => lg || !i.wide || i.focus);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      {size && (
        <AnimatePresence>
          {visible.map((item, i) => (
            <Thought key={item.id} item={item} size={size} lg={lg} profile={profile} index={i} mx={mx} my={my} origin={origin} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
