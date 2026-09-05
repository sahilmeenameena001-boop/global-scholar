"use client";
import { motion, useScroll, useSpring } from "framer-motion";
import { useActiveSection } from "@/lib/useActiveSection";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useFinePointer } from "./ui/fx";

export const STOPS = [
  { id: "top", label: "Departure" },
  { id: "countries", label: "Where" },
  { id: "quiz", label: "Match" },
  { id: "journey", label: "Route" },
  { id: "scholarships", label: "Funding" },
  { id: "stories", label: "Arrivals" },
  { id: "counsellors", label: "Crew" },
  { id: "boarding", label: "Board" },
];

/** Ruler-style chapter index: bar length marks the stop, the marker rides the scroll. */
export function ChapterRail() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const active = useActiveSection(STOPS.map((s) => s.id), "top");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });

  if (!fine) return null;

  return (
    <nav aria-label="Chapters" className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <ul className="flex flex-col items-end gap-4">
        {STOPS.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id} className="group relative flex items-center justify-end gap-3">
              <span
                aria-hidden
                className={`pointer-events-none whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 ${on ? "opacity-100 text-ivory" : "translate-x-1 opacity-0 text-faint group-hover:translate-x-0 group-hover:opacity-100"}`}
              >
                {s.label}
              </span>
              <a
                href={`#${s.id}`}
                aria-current={on ? "true" : undefined}
                aria-label={`Go to ${s.label}`}
                className="relative flex h-6 items-center"
              >
                <span
                  className={`block h-px transition-all duration-300 ${on ? "w-9 bg-royal-lit" : "w-4 bg-white/25 group-hover:w-7 group-hover:bg-white/50"}`}
                />
                {on && (
                  <motion.span
                    layoutId="rail-dot"
                    aria-hidden
                    className="absolute -right-2 size-1.5 rounded-full bg-coral"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>
      <div aria-hidden className="absolute -left-4 top-0 h-full w-px overflow-hidden bg-white/10">
        <motion.span className="block h-full w-full origin-top bg-gradient-to-b from-royal-lit to-coral" style={{ scaleY: reduce ? scrollYProgress : progress }} />
      </div>
    </nav>
  );
}
