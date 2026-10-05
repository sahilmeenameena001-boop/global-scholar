"use client";
import { motion } from "framer-motion";
import { useId } from "react";

/**
 * The thinker: a cut-paper head in profile, drawn rather than photographed so
 * it can never be read as a real student. The top of the skull is a separate
 * lid along a torn edge; it hinges back from the crown to let the thoughts out.
 *
 * Stage is 400 × 420. The cut runs from the back of the skull (96, 150) to the
 * forehead (302, 150) — `HEAD_OPENING` in the asset catalogue sits on it.
 */

const HINGE = { x: 96, y: 150 };
const W = 400;
const H = 420;

/** A torn-paper edge from forehead back to crown, shared by both halves so they fit. */
const TEAR = (() => {
  const n = 16;
  const pts: string[] = [];
  for (let i = 1; i < n; i++) {
    const x = 302 - (i * (302 - HINGE.x)) / n;
    const arch = -Math.sin((Math.PI * i) / n) * 7;
    const jag = i % 2 ? 4.5 : -3;
    pts.push(`L${x.toFixed(1)} ${(150 + arch + jag).toFixed(1)}`);
  }
  return `${pts.join(" ")} L${HINGE.x} ${HINGE.y}`;
})();

const FACE =
  "M96 150 C88 200 92 250 118 285 C128 300 132 330 128 360 L122 420 L268 420 " +
  "C262 392 258 368 262 348 C276 344 292 338 300 326 C306 318 304 308 300 302 " +
  "C306 298 310 292 306 286 C312 282 312 276 306 272 C312 266 318 258 326 254 " +
  "C332 250 330 242 322 236 C316 220 310 204 306 192 C308 180 306 166 302 150 " + TEAR + " Z";

const CROWN = "M96 150 C90 70 170 28 222 36 C282 46 314 98 302 150 " + TEAR + " Z";

function Paper({ d, uid }: { d: string; uid: string }) {
  return (
    <>
      {/* offset shadow: the cutout sits a few millimetres off the page */}
      <path d={d} transform="translate(7 9)" className="fill-void" opacity="0.55" />
      <path d={d} fill={`url(#${uid}-skin)`} />
      <path d={d} fill={`url(#${uid}-dots)`} />
      <path d={d} fill="none" className="stroke-ivory" strokeOpacity="0.28" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  );
}

function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <linearGradient id={`${uid}-skin`} x1="0.9" y1="0" x2="0.2" y2="1">
        <stop offset="0%" className="[stop-color:var(--color-royal)]" />
        <stop offset="55%" className="[stop-color:var(--color-raised)]" />
        <stop offset="100%" className="[stop-color:var(--color-surface)]" />
      </linearGradient>
      {/* halftone — the printed-collage texture */}
      <pattern id={`${uid}-dots`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <circle cx="4.5" cy="4.5" r="1.3" className="fill-royal-lit" opacity="0.22" />
      </pattern>
    </defs>
  );
}

export function HeadFigure({ open, className = "" }: { open: boolean; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div aria-hidden className={`pointer-events-none ${className}`} style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible [mask-image:linear-gradient(to_bottom,black_78%,transparent)]">
        <Defs uid={`${uid}b`} />
        <Paper d={FACE} uid={`${uid}b`} />
        {/* ear, brow and a closed, day-dreaming eye */}
        <g fill="none" className="stroke-ivory" strokeOpacity="0.45" strokeWidth="2.2" strokeLinecap="round">
          <path d="M168 206 C150 200 145 234 162 245 C170 250 177 241 172 232" />
          <path d="M264 194 Q279 186 293 191" />
          <path d="M268 210 Q279 218 290 209" />
        </g>
      </svg>

      <motion.div
        className="absolute inset-0"
        style={{ originX: HINGE.x / W, originY: HINGE.y / H }}
        initial={false}
        animate={open ? { rotate: -34, x: "-3%", y: "-9%" } : { rotate: 0, x: "0%", y: "0%" }}
        transition={{ type: "spring", stiffness: 70, damping: 13, delay: open ? 0.2 : 0 }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible">
          <Defs uid={`${uid}l`} />
          <Paper d={CROWN} uid={`${uid}l`} />
        </svg>
      </motion.div>
    </div>
  );
}
