"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { Button } from "../ui/Button";
import { Tilt } from "../ui/fx";

const bars = [3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2];

export function BoardingPass() {
  const reduce = useReducedMotion();
  return (
    <section id="boarding" aria-labelledby="cta-title" data-chapter={5} className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 30, rotate: -1 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="group rounded-3xl">
          <Tilt max={4} glare={false} className="grid overflow-hidden rounded-3xl bg-raised text-ivory shadow-lift md:grid-cols-[1fr_auto_260px]">
          <div className="p-7 sm:p-10">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-faint">
              <span>Boarding pass</span><span>Global Scholars</span>
            </div>
            <h2 id="cta-title" className="mt-6 text-3xl leading-tight sm:text-5xl">Ready to board?</h2>
            <dl className="mt-8 grid gap-5 sm:grid-cols-3">
              <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-faint">Destination</dt><dd className="mt-1 font-serif text-lg font-semibold">Your Best-Fit University</dd></div>
              <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-faint">Status</dt><dd className="mt-1 font-serif text-lg font-semibold text-royal-lit">Ready to Explore</dd></div>
              <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-faint">Next step</dt><dd className="mt-1 font-serif text-lg font-semibold">Free Profile Evaluation</dd></div>
            </dl>
            <svg aria-hidden viewBox="0 0 400 40" className="mt-8 w-full max-w-md">
              <motion.path d="M10 30 C 100 -5, 300 -5, 390 30" fill="none" stroke="#0B1F3A" strokeWidth="2" strokeDasharray="5 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.3 }} />
              <circle cx="10" cy="30" r="4" fill="#F06B5D" /><circle cx="390" cy="30" r="4" fill="#F06B5D" />
              {!reduce ? (
                <motion.g initial={{ offsetDistance: "0%" }} whileInView={{ offsetDistance: "100%" }} viewport={{ once: true }} transition={{ duration: 2.2, delay: 0.4, ease: "easeInOut" }} style={{ offsetPath: 'path("M10 30 C 100 -5, 300 -5, 390 30")', offsetRotate: "auto" }}>
                  <Plane className="size-5 text-ivory" x="-10" y="-10" />
                </motion.g>
              ) : (
                <g transform="translate(200,-3)"><Plane className="size-5 text-ivory" /></g>
              )}
              <text x="10" y="40" fontSize="8" fill="#152033" opacity="0.6">YOU</text>
              <text x="390" y="40" fontSize="8" fill="#152033" opacity="0.6" textAnchor="end">CAMPUS</text>
            </svg>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#quiz" variant="coral" arrow>Start My Study-Abroad Journey</Button>
              <Button href="#counsellors" variant="secondary">Talk to a counsellor</Button>
            </div>
          </div>
          <div aria-hidden className="relative hidden w-8 md:block">
            <div className="absolute inset-y-0 left-1/2 border-l-2 border-dashed border-white/20" />
            <div className="absolute -top-4 left-1/2 size-8 -translate-x-1/2 rounded-full bg-navy" />
            <div className="absolute -bottom-4 left-1/2 size-8 -translate-x-1/2 rounded-full bg-navy" />
          </div>
          <div aria-hidden className="relative border-t-2 border-dashed border-white/20 bg-royal/15 p-7 md:border-t-0 md:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-faint">Seat</div>
            <div className="font-serif text-4xl font-semibold">1A</div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-faint">Gate</div>
            <div className="font-serif text-2xl font-semibold">Quiz</div>
            <div className="relative mt-6 flex h-14 items-end gap-[3px] overflow-hidden">
              {bars.map((w, i) => <span key={i} className="h-full bg-navy" style={{ width: w }} />)}
              {!reduce && <motion.span aria-hidden className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/80 to-transparent" initial={{ x: "-60px" }} whileInView={{ x: "280px" }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.8, ease: "easeInOut" }} />}
            </div>
            <p className="mt-2 font-mono text-[10px] tracking-widest text-faint">GS-2026-STUDY-ABROAD</p>
          </div>
          </Tilt>
        </motion.div>
      </div>
    </section>
  );
}
