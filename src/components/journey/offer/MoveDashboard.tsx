"use client";
import { Check, Circle } from "lucide-react";
import { homeCopy } from "@/data/journey/home";
import { offerCopy } from "@/data/journey/offer";
import { calculateNextBestAction } from "@/lib/journey/nextBestAction";
import { moveSummary, offerCity, selectedOffer } from "@/lib/journey/offer";
import type { UserProfile } from "@/lib/journey/types";
import { Button } from "../../ui/Button";
import { NextBestAction } from "../NextBestAction";

/**
 * My Move: where the move stands (offer, deposit, visa, accommodation,
 * flights) and the single next thing to do. Answers "where am I, what matters
 * now, what next" with one primary button — the next action's.
 */
export function MoveDashboard({ profile, today, onCounsellor, focusRef }: {
  profile: UserProfile; today: string; onCounsellor: () => void; focusRef: (el: HTMLHeadingElement | null) => void;
}) {
  const m = offerCopy.move;
  const sel = selectedOffer(profile);
  if (!profile.offers.length) {
    const e = homeCopy.empty.offers;
    return (
      <div>
        <h2 id="journey-title" ref={focusRef} tabIndex={-1} className="text-[clamp(1.75rem,5vw,3rem)] leading-[1.05] text-ivory outline-none">{e.text}</h2>
        <div className="mt-6"><Button href={e.href} arrow>{e.cta}</Button></div>
      </div>
    );
  }
  const rows = moveSummary(profile);
  const action = calculateNextBestAction(profile, today);
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky/80">{m.eyebrow}</p>
      <h2 id="journey-title" ref={focusRef} tabIndex={-1} className="mt-2 text-[clamp(1.75rem,5vw,3rem)] leading-[1.05] text-ivory outline-none">
        {sel ? offerCity(sel) : m.eyebrow}
      </h2>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.id} className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-void/45 px-4 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="flex items-center gap-2 text-sm text-ivory">
              {r.done ? <Check aria-hidden className="size-4 text-sky" /> : <Circle aria-hidden className="size-4 text-ivory/40" />}
              {r.label}
            </span>
            <span className={`text-sm font-semibold ${r.done ? "text-sky" : "text-coral"}`}>{r.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6"><NextBestAction action={action} headingLevel={3} /></div>
      <button type="button" onClick={onCounsellor} className="mt-4 inline-flex min-h-11 items-center px-1 text-sm font-semibold text-sky underline-offset-4 hover:text-ivory hover:underline">
        {m.counsellor}
      </button>
      <p className="mt-4 max-w-[70ch] text-xs leading-relaxed text-ivory/60">{offerCopy.disclaimer}</p>
    </div>
  );
}
