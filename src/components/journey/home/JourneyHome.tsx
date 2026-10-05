"use client";
import { ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { appStatuses, bucketCopy, disciplines, intakes } from "@/data/journey/config";
import { homeCopy, usefulContent } from "@/data/journey/home";
import { todayISO } from "@/lib/journey/applying";
import { lifecycleOf } from "@/lib/journey/lifecycle";
import { calculateNextBestAction } from "@/lib/journey/nextBestAction";
import { moveSummary, offerCity, selectedOffer } from "@/lib/journey/offer";
import { byBucket, evaluateList } from "@/lib/journey/shortlist";
import { useJourney } from "@/lib/journey/store";
import type { LifecycleStage, UserProfile } from "@/lib/journey/types";
import { homeWorld } from "@/lib/journey/worlds";
import { ICONS } from "../ThoughtArt";
import { ThoughtPanel } from "../HeadWindow";
import { JourneyBar } from "../JourneyBar";
import { NextBestAction } from "../NextBestAction";

type Stage = Exclude<LifecycleStage, "anonymous">;
const MONTHS: Record<string, string> = { Jan: "January", Sep: "September" };

/** "Planning Business abroad for September 2027?" and friends — built from the student's own answers. */
function heading(stage: Stage, p: UserProfile, shortlistCount: number) {
  if (stage === "exploring") {
    const d = disciplines.find((x) => x.id === p.discipline);
    const it = intakes.find((o) => o.id === p.intake && o.id !== "undecided");
    if (d && d.id !== "undecided" && it) return `Planning ${d.short} abroad for ${it.label.replace(/^(\w{3})/, (m) => MONTHS[m] ?? m)}?`;
  }
  if (stage === "shortlisting" && shortlistCount) return `You have ${shortlistCount} ${shortlistCount === 1 ? "university" : "universities"} under consideration.`;
  if (stage === "arrival") { const o = selectedOffer(p); if (o) return `Welcome to ${offerCity(o)}`; }
  if (stage === "departure") { const o = selectedOffer(p); if (o) return `Getting ready for ${offerCity(o)}`; }
  return homeCopy.headings[stage];
}

/** The numbers that say where things stand, per stage. */
function Stats({ stage, p, list }: { stage: Stage; p: UserProfile; list: ReturnType<typeof evaluateList> }) {
  let items: string[] = [];
  let note: string | null = null;
  if (stage === "shortlisting" && list.length && p.academicScore) {
    const g = byBucket(list);
    items = (["ambitious", "target", "safe"] as const).filter((b) => g[b].length).map((b) => `${g[b].length} ${b === "safe" ? "Safer" : bucketCopy[b].label}`);
    note = "Indicative groupings from your answers, not admission chances.";
  }
  if (stage === "applying" || stage === "waiting") {
    const count = (ids: string[]) => p.applications.filter((a) => ids.includes(a.status)).length;
    items = stage === "applying"
      ? [`${p.applications.length} universities`, `${count(["submitted", "interview", "docsRequested", "awaiting", "decision", "rejected"])} submitted`, `${count(["inProgress"])} in progress`, `${count(["notStarted"])} not started`]
      : appStatuses.filter((s) => s.done).map((s) => ({ s, n: count([s.id]) })).filter((x) => x.n).map((x) => `${x.n} ${x.s.short.toLowerCase()}`);
  }
  if (stage === "offer" || stage === "departure") items = moveSummary(p).map((r) => `${r.label} ${r.value}`);
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <ul className="flex flex-wrap gap-2">
        {items.map((t) => <li key={t} className="rounded-full bg-void/45 px-3 py-1.5 text-xs font-semibold text-ivory ring-1 ring-inset ring-white/15">{t}</li>)}
      </ul>
      {note && <p className="mt-2 text-xs text-ivory/60">{note}</p>}
    </div>
  );
}

/**
 * The returning student's home. Answers three questions with one primary
 * button: where am I (the journey bar and heading), what matters right now
 * (the numbers), what should I do next (the next best action). Modules for
 * the stage follow as quieter links.
 */
export function JourneyHome({ onUpdate }: { onUpdate: () => void }) {
  const { profile } = useJourney();
  const [today] = useState(() => todayISO());
  const stage = lifecycleOf(profile, today) as Stage;
  const list = useMemo(() => evaluateList(profile.shortlist, profile), [profile]);
  const action = useMemo(() => calculateNextBestAction(profile, today), [profile, today]);
  const world = useMemo(() => homeWorld(stage, profile, today, list), [stage, profile, today, list]);
  const useful = usefulContent.filter((c) => c.stages.includes(stage));

  return (
    <section aria-labelledby="home-title" className="relative px-4 pb-20 pt-24 sm:px-8 lg:pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl"><JourneyBar /></div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-7">
            <h1 id="home-title" className="over-canvas text-[clamp(2rem,5.5vw,3.75rem)] leading-[1.02] text-ivory">{heading(stage, profile, list.length)}</h1>
            <Stats stage={stage} p={profile} list={list} />
            <div className="mt-8"><NextBestAction action={action} /></div>
          </div>
          <div className="lg:col-span-5"><ThoughtPanel world={world} /></div>
        </div>

        <h2 className="mt-16 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky/80">{homeCopy.modulesLabel}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {homeCopy.modules[stage].map((m) => {
            const Icon = ICONS[m.icon] ?? ICONS.sparkles;
            return (
              <li key={m.id}>
                <Link href={m.href} className="group flex h-full min-h-24 items-start gap-4 rounded-2xl bg-surface/80 p-5 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:ring-royal-lit/50">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-royal/25 text-royal-lit"><Icon className="size-5" /></span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-serif text-lg text-ivory">{m.title} <ArrowRight aria-hidden className="size-4 opacity-0 transition-opacity group-hover:opacity-100" /></span>
                    <span className="mt-0.5 block text-sm text-mist">{m.text}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {useful.length > 0 && (
          <>
            <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky/80">{homeCopy.usefulTitle}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {useful.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-ivory ring-1 ring-inset ring-white/15 hover:ring-white/35">{c.title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <button type="button" onClick={onUpdate} className="mt-12 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-mist hover:text-ivory">
          <RotateCcw aria-hidden className="size-4" /> {homeCopy.update}
        </button>
      </div>
    </section>
  );
}
