"use client";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const W = 600;
const H = 92;
/** Quadratic arc: a flight path bows upward between the first and last stop. */
const P0 = { x: 34, y: 68 };
const P1 = { x: W / 2, y: 4 };
const P2 = { x: W - 34, y: 68 };

const at = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
});
/** Tangent angle in degrees, so the plane banks along the curve. */
const heading = (t: number) => {
  const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
  const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

const PATH = `M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`;
const SPRING = { type: "spring", stiffness: 120, damping: 20 } as const;

/**
 * The route strip under the deck. Each country is a stop on one flight path and
 * the plane flies to whichever card is showing, so swiping reads as travelling
 * rather than as paging through a list. Decorative — the deck itself carries the
 * accessible position information.
 */
export function RouteLine({ stops, active, accent }: { stops: { id: string; code: string }[]; active: number; accent: string }) {
  const reduce = useReducedMotion();
  const n = Math.max(stops.length - 1, 1);
  const t = active / n;
  const p = at(t);

  return (
    <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className="mt-8 h-20 w-full overflow-visible" preserveAspectRatio="xMidYMid meet">
      <path d={PATH} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 7" strokeLinecap="round" className="text-white/15" />

      {/* the leg already flown, drawn solid in the active country's colour */}
      <motion.path
        d={PATH}
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={{ pathLength: Math.max(t, 0.001) }}
        transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {stops.map((s, i) => {
        const sp = at(i / n);
        const on = i === active;
        const passed = i < active;
        return (
          <g key={s.id}>
            <motion.circle
              cx={sp.x}
              cy={sp.y}
              initial={false}
              animate={{ r: on ? 6 : 3.5, opacity: on || passed ? 1 : 0.4 }}
              transition={reduce ? { duration: 0 } : SPRING}
              fill={on || passed ? accent : "#8fa3c8"}
            />
            <text x={sp.x} y={sp.y + 22} textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1.5" fill={on ? accent : "#6f81a3"}>
              {s.code}
            </text>
          </g>
        );
      })}

      <motion.g
        initial={false}
        animate={{ x: p.x, y: p.y, rotate: heading(t) }}
        transition={reduce ? { duration: 0 } : SPRING}
      >
        <circle r="11" fill={accent} opacity="0.18" />
        <Plane x="-7" y="-7" width="14" height="14" className="text-ivory" stroke="currentColor" />
      </motion.g>
    </svg>
  );
}
