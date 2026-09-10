"use client";
import { motion } from "framer-motion";
import type { Country } from "@/data/countries";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Generated destination artwork.
 *
 * Each country card gets an illustrated scene rather than a photo: a graded sky
 * in the country's accent colour, a hill line, a landmark silhouette and a
 * departing flight arc. It is drawn in code so the art themes with the palette,
 * costs nothing to load and cannot be mistaken for a photograph of a real place.
 */

type Shape = { d: string; fill?: "ink" | "accent" | "wash" };

/** Landmark silhouettes, all drawn on a 200x140 stage with the ground at y=112. */
const LANDMARK: Record<Country["landmark"], Shape[]> = {
  bigben: [
    { d: "M62 112 V80 h30 v32 Z", fill: "wash" },
    { d: "M108 112 V84 h24 v28 Z", fill: "wash" },
    { d: "M91 112 V36 h18 v76 Z" },
    { d: "M91 36 L100 12 L109 36 Z" },
    { d: "M100 47 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 Z", fill: "accent" },
    { d: "M68 88 h6 v18 h-6 Z M80 88 h6 v18 h-6 Z M114 92 h6 v14 h-6 Z M124 92 h6 v14 h-6 Z", fill: "accent" },
  ],
  cntower: [
    { d: "M56 112 V92 h26 v20 Z", fill: "wash" },
    { d: "M124 112 V86 h22 v26 Z", fill: "wash" },
    { d: "M95 112 L97 44 h6 l2 68 Z" },
    { d: "M100 46 m-15 0 a15 6 0 1 0 30 0 a15 6 0 1 0 -30 0 Z" },
    { d: "M92 62 q8 5 16 0 v7 q-8 5 -16 0 Z", fill: "accent" },
    { d: "M99 44 V14 h2 v30 Z" },
  ],
  opera: [
    { d: "M44 112 Q56 78 70 112 Z", fill: "wash" },
    { d: "M58 112 Q80 44 102 112 Z" },
    { d: "M86 112 Q108 52 130 112 Z" },
    { d: "M112 112 Q128 68 146 112 Z", fill: "wash" },
    { d: "M38 112 h124 v6 H38 Z", fill: "accent" },
  ],
  liberty: [
    { d: "M82 112 V92 h36 v20 Z", fill: "wash" },
    { d: "M87 92 V82 h26 v10 Z" },
    { d: "M94 82 L97 50 h6 l3 32 Z" },
    { d: "M100 44 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 Z" },
    { d: "M92 40 l3 -9 3 7 2 -10 3 10 3 -7 3 9 Z" },
    { d: "M106 56 L117 32 l4 2 L110 59 Z" },
    { d: "M119 30 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 Z", fill: "accent" },
  ],
  gate: [
    { d: "M58 58 h84 v10 H58 Z" },
    { d: "M64 68 h7 v44 h-7 Z M78 68 h7 v44 h-7 Z M92 68 h7 v44 h-7 Z M106 68 h7 v44 h-7 Z M120 68 h7 v44 h-7 Z M133 68 h6 v44 h-6 Z" },
    { d: "M90 58 V48 h20 v10 Z" },
    { d: "M94 48 q6 -8 12 0 Z", fill: "accent" },
    { d: "M46 112 h108 v6 H46 Z", fill: "wash" },
  ],
};

const FLIGHT = "M18 96 Q100 22 182 74";

export function CountryArt({ c, active, className = "" }: { c: Country; active: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const gid = `art-${c.id}`;
  const on = active || reduce;
  const ink = { ink: "#04070d", accent: c.accent, wash: "#0b1424" } as const;

  return (
    <svg aria-hidden viewBox="0 0 200 140" className={`block w-full ${className}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${gid}-base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b86ff" stopOpacity="0.30" />
          <stop offset="70%" stopColor="#0d1728" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.accent} stopOpacity="0.6" />
          <stop offset="55%" stopColor={c.accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor="#04070d" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`${gid}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1728" />
          <stop offset="100%" stopColor="#04070d" />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <rect width="200" height="140" rx="10" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${gid}-clip)`}>
        <rect width="200" height="140" fill={`url(#${gid}-base)`} />
        <rect width="200" height="140" fill={`url(#${gid}-sky)`} />

        {/* sun, hills, then the skyline in front of them */}
        <motion.circle
          cx="152" cy="42" r="16" fill={c.accent} opacity="0.5"
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={on ? { scale: 1, opacity: 0.5 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "152px 42px" }}
        />
        <path d="M0 112 Q40 92 74 112 Z" fill="#0b1424" />
        <path d="M126 112 Q166 88 200 112 Z" fill="#0b1424" />

        <motion.g
          initial={reduce ? false : { y: 14, opacity: 0 }}
          animate={on ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          stroke="#f7f4ec"
          strokeOpacity="0.22"
          strokeWidth="0.7"
        >
          {LANDMARK[c.landmark].map((s, i) => (
            <path key={i} d={s.d} fill={ink[s.fill ?? "ink"]} opacity={s.fill === "accent" ? 0.85 : 1} />
          ))}
        </motion.g>

        <rect y="112" width="200" height="28" fill={`url(#${gid}-ground)`} />
        <path d="M0 112 h200" stroke={c.accent} strokeOpacity="0.5" strokeWidth="1.5" />

        {/* the flight leaving for this country */}
        <motion.path
          d={FLIGHT} fill="none" stroke="#f7f4ec" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="4 5" strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={on ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
        />
        <motion.g
          initial={reduce ? false : { offsetDistance: "0%", opacity: 0 }}
          animate={on ? { offsetDistance: "100%", opacity: 1 } : {}}
          transition={{ duration: 1.6, delay: 0.3, ease: "easeInOut" }}
          style={{ offsetPath: `path("${FLIGHT}")`, offsetRotate: "auto" }}
        >
          <path d="M-5 0 L4 0 M-2 -3 L4 0 L-2 3" fill="none" stroke="#f7f4ec" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      </g>
      <rect width="200" height="140" rx="10" fill="none" stroke="#ffffff" strokeOpacity="0.12" />
    </svg>
  );
}
