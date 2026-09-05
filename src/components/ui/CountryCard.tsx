"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Calendar, ChevronDown, Clock, Coins, Sparkles } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import type { Country } from "@/data/countries";
import { StampIn, Tilt } from "./fx";

/* Landmark outlines drawn stroke-by-stroke like a pen sketch. */
const SKETCH: Record<Country["landmark"], string[]> = {
  bigben: ["M40 130 h90", "M70 130 v-90 h20 v90", "M70 40 L80 20 L90 40", "M74 55 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0", "M80 55 v-4 M80 55 h3", "M40 130 v-38 h30 M130 130 v-38 h-40", "M46 100 h18 M46 110 h18 M96 100 h18 M96 110 h18"],
  cntower: ["M30 130 h100", "M80 130 v-110", "M62 62 a18 8 0 1 0 36 0 a18 8 0 1 0 -36 0", "M74 70 v60 M86 70 v60", "M66 100 a14 5 0 1 0 28 0", "M80 20 l-3 -8 M80 20 l3 -8"],
  opera: ["M10 130 h140", "M20 128 Q60 30 100 128", "M60 128 Q100 40 140 128", "M95 128 Q130 70 158 128", "M35 128 Q60 70 82 128", "M28 118 h100"],
  liberty: ["M50 130 h60", "M55 130 v-12 h50 v12", "M70 118 v-58 h20 v58", "M80 50 a10 10 0 1 0 0.1 0", "M70 42 l4 -10 4 10 4 -10 4 10", "M90 68 L100 30 l3 -6 M96 24 h8", "M60 80 l10 -8 M72 100 h16"],
  gate: ["M20 130 h120", "M30 60 h100 v-10 h-100 z", "M35 60 v70 M45 60 v70 M60 60 v70 M70 60 v70 M85 60 v70 M95 60 v70 M110 60 v70 M120 60 v70", "M60 50 L80 30 L100 50", "M72 40 h16", "M74 36 l6 -6 6 6"],
};

function Sketch({ id, kind, colour, active, reduce }: { id: string; kind: Country["landmark"]; colour: string; active: boolean; reduce: boolean }) {
  const paths = SKETCH[kind];
  const fid = `rough-${id}`;
  return (
    <svg aria-hidden viewBox="0 0 160 140" className="h-28 w-full">
      <defs>
        <filter id={fid} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
      </defs>
      <g filter={`url(#${fid})`} fill="none" stroke={colour} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d, i) => (
          <motion.path key={d} d={d} initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={active ? { pathLength: 1, opacity: 1 } : {}} transition={{ duration: 0.55, delay: 0.15 + i * 0.18, ease: "easeInOut" }} />
        ))}
      </g>
      {/* colour wash after the outline */}
      <motion.g fill={colour} initial={reduce ? false : { opacity: 0 }} animate={active ? { opacity: 0.16 } : {}} transition={{ delay: 0.3 + paths.length * 0.18, duration: 0.6 }}>
        {kind === "bigben" && <><rect x="70" y="40" width="20" height="90" /><rect x="40" y="92" width="90" height="38" /></>}
        {kind === "cntower" && <><ellipse cx="80" cy="62" rx="18" ry="8" /><rect x="74" y="70" width="12" height="60" /></>}
        {kind === "opera" && <><path d="M20 128 Q60 30 100 128Z" /><path d="M60 128 Q100 40 140 128Z" /></>}
        {kind === "liberty" && <><rect x="70" y="60" width="20" height="58" /><circle cx="80" cy="50" r="10" /></>}
        {kind === "gate" && <><rect x="30" y="50" width="100" height="10" /><path d="M60 50 L80 30 L100 50Z" /></>}
      </motion.g>
    </svg>
  );
}

type CompareCtl = { pinned: boolean; toggle: () => void; chip: ReactNode };

export function CountryCard({ c, index, compare }: { c: Country; index: number; compare?: CompareCtl }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const active = useInView(ref, { once: true, margin: "-80px" });
  const panelId = `country-${c.id}-details`;
  const tilt = index % 2 === 0 ? -1.5 : 1.2;

  return (
    <motion.article
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 30, rotate: tilt * 2 }}
      animate={active ? { opacity: 1, y: 0, rotate: reduce ? 0 : tilt } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { rotate: 0, y: -6, scale: 1.02 }}
      onHoverStart={() => setOpen(true)} onHoverEnd={() => setOpen(false)}
      className="group flex flex-col"
    >
      <Tilt max={6} className={`flex flex-1 flex-col overflow-hidden rounded-2xl border bg-surface shadow-card transition-shadow hover:shadow-lift ${compare?.pinned ? "border-royal ring-2 ring-royal/35" : "border-white/10"}`}>
      <div className="paper relative px-5 pt-7">
        <span aria-hidden className="absolute -top-1 left-1/2 h-5 w-20 -translate-x-1/2 rotate-[-4deg] bg-coral/40 shadow-sm [mask-image:repeating-linear-gradient(90deg,black_0_6px,rgba(0,0,0,0.7)_6px_8px)]" />
        <StampIn delay={0.5 + index * 0.1} className="absolute right-3 top-3"><span className="block rounded-sm border-2 border-white/30 px-1.5 py-0.5 font-serif text-[10px] font-bold uppercase tracking-widest text-ivory">{c.code}</span></StampIn>
        <Sketch id={c.id} kind={c.landmark} colour={c.accent} active={active} reduce={reduce} />
        <p className="pb-2 text-right font-[family-name:var(--font-hand)] text-lg leading-none text-ivory/70" style={{ transform: "rotate(-2deg)" }}>
          sketch no. {String(index + 1).padStart(2, "0")}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl text-ivory">{c.name}</h3>
        <p className="mt-1 text-sm text-mist">{c.tagline}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2"><Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-royal-lit" /><dt className="sr-only">Typical duration</dt><dd className="text-mist">{c.duration}</dd></div>
          <div className="flex gap-2"><Calendar aria-hidden className="mt-0.5 size-4 shrink-0 text-royal-lit" /><dt className="sr-only">Popular intake</dt><dd className="text-mist">Intake: {c.intake}</dd></div>
          <div className="flex gap-2"><Coins aria-hidden className="mt-0.5 size-4 shrink-0 text-royal-lit" /><dt className="sr-only">Approximate annual tuition</dt><dd className="text-mist">Tuition: {c.tuition} / yr</dd></div>
        </dl>

        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)} className="mt-4 flex min-h-11 items-center gap-1 text-sm font-semibold text-royal-lit">
          {open ? "Less" : "More details"} <ChevronDown aria-hidden className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <div id={panelId} className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-faint">Popular subjects</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">{c.subjects.map((s) => <li key={s} className="rounded-full bg-raised px-2.5 py-1 text-xs font-medium text-ivory">{s}</li>)}</ul>
            <p className="mt-3 flex items-start gap-2 text-sm text-mist"><Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-coral" /> Scholarships: {c.scholarships}</p>
          </div>
        </div>

        {compare && (
          <button
            type="button"
            aria-pressed={compare.pinned}
            onClick={compare.toggle}
            className={`mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${compare.pinned ? "border-royal bg-royal/20 text-ivory" : "border-white/15 text-ivory hover:border-royal"}`}
          >
            {!compare.pinned && compare.chip}
            {compare.pinned ? `${c.name} pinned` : "Pin to compare"}
          </button>
        )}

        <a href="#quiz" className="mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/15 px-5 text-sm font-semibold text-ivory transition-colors group-hover:border-royal group-hover:bg-royal group-hover:text-white">
          Explore {c.name} <ArrowUpRight aria-hidden className="size-4" />
        </a>
      </div>
      </Tilt>
    </motion.article>
  );
}
