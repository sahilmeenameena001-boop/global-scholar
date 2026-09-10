"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Calendar, ChevronDown, Clock, Coins, Sparkles } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useRef, useState } from "react";
import type { Country } from "@/data/countries";
import { CountryArt } from "./CountryArt";
import { StampIn, Tilt } from "./fx";

type CompareCtl = { pinned: boolean; toggle: () => void; chip: ReactNode };

export function CountryCard({
  c, index, compare, entrance = true,
}: { c: Country; index: number; compare?: CompareCtl; entrance?: boolean }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  // inside the deck the card is mounted already visible — its parent runs the transition
  const active = entrance ? inView : true;
  const panelId = `country-${c.id}-details`;
  const tilt = index % 2 === 0 ? -1.5 : 1.2;

  return (
    <motion.article
      ref={ref}
      initial={reduce || !entrance ? false : { opacity: 0, y: 30, rotate: tilt * 2 }}
      animate={active ? { opacity: 1, y: 0, rotate: reduce ? 0 : tilt } : {}}
      transition={{ delay: entrance ? index * 0.1 : 0, duration: entrance ? 0.6 : 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { rotate: 0, y: -6, scale: 1.02 }}
      onHoverStart={() => setOpen(true)} onHoverEnd={() => setOpen(false)}
      className="group flex flex-col"
    >
      <Tilt max={6} className={`flex flex-1 flex-col overflow-hidden rounded-2xl border bg-surface shadow-card transition-shadow hover:shadow-lift ${compare?.pinned ? "border-royal ring-2 ring-royal/35" : "border-white/10"}`}>
      <div className="relative">
        <CountryArt c={c} active={active} className="h-36" />
        <span aria-hidden className="absolute -top-1 left-1/2 h-5 w-20 -translate-x-1/2 rotate-[-4deg] bg-coral/40 shadow-sm [mask-image:repeating-linear-gradient(90deg,black_0_6px,rgba(0,0,0,0.7)_6px_8px)]" />
        <StampIn delay={0.5 + index * 0.1} className="absolute right-3 top-3"><span className="block rounded-sm border-2 border-white/40 bg-void/40 px-1.5 py-0.5 font-serif text-[10px] font-bold uppercase tracking-widest text-ivory backdrop-blur-sm">{c.code}</span></StampIn>
        <p className="absolute bottom-1.5 right-3 font-[family-name:var(--font-hand)] text-lg leading-none text-ivory/80" style={{ transform: "rotate(-2deg)" }}>
          plate no. {String(index + 1).padStart(2, "0")}
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

        <Link href="/universities" className="mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/15 px-5 text-sm font-semibold text-ivory transition-colors group-hover:border-royal group-hover:bg-royal group-hover:text-white">
          Match me with {c.name} universities <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </div>
      </Tilt>
    </motion.article>
  );
}
