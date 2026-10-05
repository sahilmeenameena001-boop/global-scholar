"use client";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { barStopFor, journeyBar } from "@/data/journey/home";
import { todayISO } from "@/lib/journey/applying";
import { contextChips, lifecycleOf } from "@/lib/journey/lifecycle";
import { useJourney } from "@/lib/journey/store";

/**
 * The persistent journey bar: Exploring → Shortlisting → Applying → Offer →
 * Departure with the current stage lit, plus the student's context (Business ·
 * UK · Sep 2027) and a way to edit it. Every stop is a door into that stage.
 * Editing an earlier answer never clears later ones.
 */
export function JourneyBar() {
  const { profile } = useJourney();
  const [today] = useState(() => todayISO());
  const stage = lifecycleOf(profile, today);
  const current = stage === "anonymous" ? null : barStopFor[stage];
  const at = journeyBar.stops.findIndex((s) => s.id === current);
  const chips = contextChips(profile);
  const n = journeyBar.stops.length;

  return (
    <div>
      <nav aria-label={journeyBar.label} className="relative">
        {/* dots sit at the centre of each fifth: the road runs 10% → 90% */}
        <span aria-hidden className="absolute left-[10%] right-[10%] top-[1.125rem] h-px bg-white/15" />
        {at > 0 && (
          <motion.span
            aria-hidden
            className="absolute left-[10%] top-[1.125rem] h-px w-[80%] origin-left bg-gradient-to-r from-royal-lit to-coral"
            initial={false}
            animate={{ scaleX: at / (n - 1) }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          />
        )}
        <ol className="relative grid grid-cols-5">
          {journeyBar.stops.map((s, i) => {
            const on = s.id === current;
            return (
              <li key={s.id} className="flex justify-center">
                <Link href={s.href} aria-current={on ? "step" : undefined} className="group flex min-h-11 flex-col items-center gap-1.5 rounded-lg px-1 pt-3">
                  <span aria-hidden className={`relative size-3 rounded-full transition-colors ${on ? "bg-coral" : at >= 0 && i < at ? "bg-royal-lit" : "bg-white/25 group-hover:bg-white/45"}`}>
                    {on && <motion.span layoutId="bar-halo" className="absolute -inset-1.5 rounded-full ring-1 ring-coral/60" />}
                  </span>
                  <span className={`text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.2em] ${on ? "text-ivory" : "text-ivory/55 group-hover:text-ivory/80"}`}>{s.label}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      {chips.length > 0 && (
        <ul aria-label="Your answers" className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <li key={c.id} className="rounded-full bg-void/45 px-3 py-1.5 text-xs font-semibold text-ivory ring-1 ring-inset ring-ivory/15 backdrop-blur-sm">{c.text}</li>
          ))}
          <li>
            <Link href={chips[0].href} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-sky hover:text-ivory">
              <Pencil aria-hidden className="size-3" /> {journeyBar.edit}
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
