"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { motion, useInView, useScroll, useSpring } from "framer-motion";
import { ClipboardCheck, Coins, FileText, Globe2, Plane, Stamp } from "lucide-react";
import { useRef } from "react";
import { journeySteps } from "@/data/content";
import { navByHref } from "@/data/nav";
import { ChapterHead } from "../ui/Chapter";

const meta = navByHref["/how-it-works"];
const icons = [ClipboardCheck, Globe2, FileText, Coins, Stamp, Plane];

function Step({ i }: { i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const active = useInView(ref, { once: true, margin: "-35% 0px -35% 0px" });
  const reduce = useReducedMotion();
  const s = journeySteps[i];
  const Icon = icons[i];
  const left = i % 2 === 0;
  return (
    <li ref={ref} className={`relative grid gap-4 md:grid-cols-2 md:gap-12 ${active ? "in-view" : ""}`}>
      <div className={`flex items-start gap-4 ${left ? "md:col-start-1" : "md:col-start-2"} ${left ? "md:flex-row-reverse md:text-right" : ""}`}>
        <span aria-hidden className={`absolute left-4 top-0 grid size-11 -translate-x-1/2 place-items-center rounded-full border-2 transition-all duration-500 md:left-1/2 ${active ? "border-royal bg-royal text-white shadow-card" : "border-white/20 bg-raised text-ivory/40"}`}>
          <Icon className="size-5" />
        </span>
        <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={active ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.15 }} className="relative ml-10 rounded-3xl border border-white/10 bg-surface p-6 shadow-card md:ml-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-lit">Step {i + 1}</p>
          <h3 className="mt-1 text-xl text-ivory sm:text-2xl">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-mist">{s.text}</p>
          <motion.span aria-hidden initial={{ opacity: 0, scale: 1.6 }} animate={active ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.35, delay: 0.5, ease: "backOut" }} className={`stamp absolute -top-3 rounded-md px-2 py-0.5 text-[10px] font-bold text-coral ${left ? "left-4 md:left-auto md:right-4" : "right-4"}`}>
            {s.stamp}
          </motion.span>
        </motion.div>
      </div>
    </li>
  );
}

export function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 70%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  return (
    <section id="journey" aria-labelledby="journey-title" data-chapter={3} className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ChapterHead id="journey-title" index={meta.index} eyebrow={meta.eyebrow} title="Six stages, one counsellor, no guesswork." lede="A clear checklist at every stop along the route, from first assessment to the day you fly." />
        <div ref={ref} className="relative mt-16">
          <div aria-hidden className="absolute bottom-0 left-4 top-0 w-0.5 border-l-2 border-dashed border-white/15 md:left-1/2" />
          <motion.div aria-hidden className="absolute left-4 top-0 h-full w-0.5 origin-top bg-royal md:left-1/2" style={{ scaleY: reduce ? 1 : scaleY }} />
          <ol className="space-y-12">
            {journeySteps.map((_, i) => <Step key={i} i={i} />)}
          </ol>
        </div>
      </div>
    </section>
  );
}
