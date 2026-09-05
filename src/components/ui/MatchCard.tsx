"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { animate, motion, useInView, useSpring } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UniversityMatch } from "@/data/quiz";

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const ctrl = animate(0, to, { duration: 1.2, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => ctrl.stop();
  }, [inView, to, reduce]);
  return <span ref={ref}>{reduce ? to : n}{suffix}</span>;
}

/** Spring-driven counter: settles onto the final figure instead of easing flat into it. */
export function SpringCount({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const mv = useSpring(0, { stiffness: 58, damping: 17, mass: 1.1, restDelta: 0.01 });
  const [n, setN] = useState(0);

  useEffect(() => { if (inView && !reduce) mv.set(to); }, [inView, to, reduce, mv]);
  useEffect(() => mv.on("change", (v) => setN(Math.min(to, Math.round(v)))), [mv, to]);

  return <span ref={ref}>{reduce ? to : n}{suffix}</span>;
}

export function MatchCard({ m, index }: { m: UniversityMatch; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: -68, y: 26, transformPerspective: 1100 }}
      animate={{ opacity: 1, rotateY: 0, y: 0, transformPerspective: 1100 }}
      transition={{ delay: 0.12 + index * 0.14, type: "spring", stiffness: 190, damping: 24 }}
      style={{ transformOrigin: "18% 50%" }}
      className="flex flex-col rounded-3xl border border-white/10 bg-surface p-6 shadow-card [backface-visibility:hidden]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-serif text-xl leading-tight text-ivory">{m.name}</h4>
          <p className="mt-1 flex items-center gap-1 text-sm text-mist"><MapPin aria-hidden className="size-3.5" /> {m.country}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-serif text-3xl font-semibold text-royal-lit"><CountUp to={m.match} suffix="%" /></p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">match</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-ivory">{m.course}</p>
      <dl className="mt-3 space-y-1.5 text-sm text-mist">
        <div className="flex justify-between gap-3"><dt className="text-faint">Tuition</dt><dd className="text-right">{m.tuition}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-faint">Scholarship</dt><dd className="text-right">{m.scholarship}</dd></div>
      </dl>
      <p className="mt-4 flex gap-2 rounded-2xl bg-raised p-3 text-sm text-mist"><Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-coral" /> {m.reason}</p>
    </motion.article>
  );
}
