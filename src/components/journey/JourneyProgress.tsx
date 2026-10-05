"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { journeyArc } from "@/data/journey/config";
import type { Stage } from "@/lib/journey/types";
import { stageHref } from "./useGoToStage";

/**
 * Dream → Decide → Do → Depart. Not a stepper: it says where the student is
 * on the whole road, and every stop is a door into that stage, so a student
 * can move on (or back) whenever their situation changes.
 */
export function JourneyProgress({ current }: { current: Stage | null }) {
  const at = journeyArc.findIndex((s) => s.id === current);
  return (
    <nav aria-label="Your study-abroad journey" className="relative -mx-2">
      {/* dots sit at the centre of each quarter, so the road runs 12.5% → 87.5% */}
      <span aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[1.125rem] h-px bg-white/12" />
      {at > 0 && (
        <motion.span
          aria-hidden
          className="absolute left-[12.5%] top-[1.125rem] h-px w-[75%] origin-left bg-gradient-to-r from-royal-lit to-coral"
          initial={false}
          animate={{ scaleX: at / (journeyArc.length - 1) }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      )}
      <ol className="relative grid grid-cols-4">
        {journeyArc.map((s, i) => {
          const on = s.id === current;
          const passed = at >= 0 && i < at;
          return (
            <li key={s.id} className="flex justify-center">
              <Link
                href={stageHref(s.id)}
                aria-current={on ? "step" : undefined}
                className="group flex min-h-11 flex-col items-center gap-1.5 rounded-lg px-2 pt-3"
              >
                <span aria-hidden className={`relative grid size-3 place-items-center rounded-full transition-colors ${on ? "bg-coral" : passed ? "bg-royal-lit" : "bg-white/20 group-hover:bg-white/40"}`}>
                  {on && <motion.span layoutId="arc-halo" className="absolute -inset-1.5 rounded-full ring-1 ring-coral/60" />}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors ${on ? "text-ivory" : "text-faint group-hover:text-mist"}`}>{s.arc}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
