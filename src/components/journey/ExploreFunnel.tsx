"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Pencil, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  DECIDE, MAX_PRIORITIES, disciplines, exploringCopy as copy, intakes, priorities, stageById,
} from "@/data/journey/config";
import { destinations } from "@/data/journey/destinations";
import { profileMeta, track } from "@/lib/journey/analytics";
import { revealFormula } from "@/lib/journey/explore";
import { journey } from "@/lib/journey/store";
import type { DestinationId, DisciplineId, ExploringStep, PriorityId, UserProfile } from "@/lib/journey/types";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Button } from "../ui/Button";
import { DemoBadge } from "../ui/SectionHeading";
import { FloatingCTA } from "./FloatingCTA";

/** What is being hovered or focused, so the head can preview it before it is chosen. */
export type Preview =
  | { kind: "discipline"; id: DisciplineId }
  | { kind: "destination"; id: DestinationId | typeof DECIDE }
  | { kind: "intake"; id: string }
  | { kind: "priority"; id: PriorityId };

const NEXT: Record<ExploringStep, ExploringStep> = {
  course: "destination", destination: "intake", intake: "priorities", priorities: "result", result: "result",
};
const PREV: Record<ExploringStep, ExploringStep | null> = {
  course: null, destination: "course", intake: "destination", priorities: "intake", result: "priorities",
};
const TILTS = [-2.5, 1.5, -1, 2.5, -1.8, 1, -0.6, 2];

/** One option: previews inside the head on hover or focus, picks on click. */
function Choice({ label, i, on, icon, muted, preview, onPreview, onPick }: {
  label: string; i: number; on: boolean; icon?: string; muted?: boolean;
  preview: Preview; onPreview: (p: Preview | null) => void; onPick: () => void;
}) {
  return (
    <FloatingCTA
      label={label}
      icon={icon}
      selected={on}
      muted={muted}
      tilt={TILTS[i % TILTS.length]}
      index={i}
      onClick={onPick}
      onIntent={() => onPreview(preview)}
      onLeave={() => onPreview(null)}
      className="min-h-11 text-[13px] lg:text-sm"
    />
  );
}

type Props = {
  profile: UserProfile;
  step: ExploringStep;
  onStep: (s: ExploringStep) => void;
  onPreview: (p: Preview | null) => void;
  onUnlock: () => void;
  onBestFit: () => void;
  onCounsellor: () => void;
};

/**
 * The exploring funnel: Course → Destination → Intake → Priorities → reveal.
 * Every option previews inside the head on hover or focus, and changes it for
 * good when picked. Renders two slots — the locked state with the answers so
 * far, and the current question — which the intro places beside the film on
 * desktop and stacks in a sheet on phones.
 */
export function ExploreFunnel({ profile, step, onStep, onPreview, onUnlock, onBestFit, onCounsellor }: Props) {
  const reduce = useReducedMotion();
  const promptId = useId();
  const [notice, setNotice] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const moved = useRef(false);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const go = useCallback((s: ExploringStep) => {
    window.clearTimeout(timer.current);
    moved.current = true;
    setNotice("");
    onPreview(null);
    onStep(s);
  }, [onPreview, onStep]);

  /** Single answers move on by themselves, after a beat so the head visibly settles on the choice. */
  const advance = (from: ExploringStep) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => go(NEXT[from]), reduce ? 300 : 900);
  };

  const focusPrompt = useCallback((el: HTMLHeadingElement | null) => {
    if (el && moved.current) el.focus();
  }, []);

  const meta = (extra = {}) => ({ ...profileMeta(journey.get().profile, "exploring"), ...extra });

  const pickDiscipline = (id: DisciplineId) => {
    journey.patch({ discipline: id, course: null });
    track("discipline_selected", meta({ discipline: id }));
    advance("course");
  };
  const pickDestination = (id: DestinationId | typeof DECIDE) => {
    journey.patch(id === DECIDE ? { destinations: [], openDestination: true } : { destinations: [id], openDestination: false });
    track("destination_selected", meta({ destination: id }));
    advance("destination");
  };
  const pickIntake = (id: string) => {
    journey.patch({ intake: id });
    track("intake_selected", meta({ intake: id }));
    advance("intake");
  };
  const togglePriority = (id: PriorityId) => {
    const cur = journey.get().profile.priorities;
    if (cur.includes(id)) {
      journey.patch({ priorities: cur.filter((x) => x !== id) });
      setNotice("");
      track("priority_selected", meta({ priority: id, action: "removed" }));
    } else if (cur.length >= MAX_PRIORITIES) {
      setNotice(copy.maxed);
    } else {
      journey.patch({ priorities: [...cur, id] });
      setNotice("");
      track("priority_selected", meta({ priority: id, action: "added" }));
    }
  };
  const revealWorld = () => {
    if (!journey.get().profile.priorities.length) { setNotice(copy.pickOne); return; }
    track("exploration_completed", meta());
    go("result");
  };

  const prompt = (text: string, hint?: string) => (
    <>
      <h2 id="journey-title" ref={focusPrompt} tabIndex={-1} className="text-[clamp(1.5rem,4.8vw,2.4rem)] leading-[1.05] text-ivory outline-none">
        <span id={promptId}>{text}</span>
      </h2>
      {hint && <p className="mt-1.5 hidden font-hand text-lg leading-tight text-sky/80 sm:block">{hint}</p>}
    </>
  );

  const formula = revealFormula(profile);
  const cfg = stageById.exploring;
  const pins: { step: ExploringStep; text: string }[] = step === "result" ? [] : [
    ...(profile.discipline ? [{ step: "course" as const, text: disciplines.find((d) => d.id === profile.discipline)!.short }] : []),
    ...(profile.destinations[0] || profile.openDestination
      ? [{ step: "destination" as const, text: profile.destinations[0] ? destinations.find((d) => d.id === profile.destinations[0])!.label : copy.destination.decide }]
      : []),
    ...(profile.intake ? [{ step: "intake" as const, text: intakes.find((o) => o.id === profile.intake)!.short }] : []),
  ];

  return (
    <>
      {/* the locked state, and the answers so far — each a way back */}
      <div className="lg:absolute lg:right-[calc(50%+28.125svh+2rem)] lg:top-[24%] lg:w-[15rem]">
        <motion.div
          layoutId="stage-exploring"
          className="flex items-center justify-between gap-3 rounded-[4px] bg-ivory py-2 pl-4 pr-1.5 text-ink shadow-lift lg:flex-col lg:items-start lg:p-4"
        >
          <span>
            <span className="block font-hand text-base leading-none opacity-70">{cfg.arc} · {copy.locked}</span>
            <span className="block font-serif text-base font-semibold leading-tight lg:text-lg">{cfg.cta}</span>
          </span>
          <button type="button" onClick={onUnlock} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-ink/70 hover:bg-ink/5 hover:text-ink lg:-ml-3">
            <X aria-hidden className="size-3.5" /> {copy.change}
          </button>
        </motion.div>
        {pins.length > 0 && (
          <ul aria-label={copy.pins} className="mt-3 flex flex-wrap gap-2">
            {pins.map((p) => (
              <li key={p.step}>
                <button
                  type="button"
                  onClick={() => go(p.step)}
                  aria-label={`${copy.edit}: ${p.text}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-void/35 px-3.5 text-xs font-semibold text-ivory ring-1 ring-inset ring-ivory/20 hover:ring-ivory/50"
                >
                  {p.text} <Pencil aria-hidden className="size-3 opacity-60" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* the current question */}
      <div className="mt-5 lg:absolute lg:left-[calc(50%+28.125svh+2rem)] lg:top-1/2 lg:mt-0 lg:w-[min(27rem,calc(50%-28.125svh-4rem))] lg:-translate-y-1/2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === "course" && (
              <>
                {prompt(copy.course.prompt, copy.course.hint)}
                <div role="group" aria-labelledby={promptId} className="mt-4 flex flex-wrap gap-2">
                  {disciplines.map((d, i) => <Choice key={d.id} label={d.label} i={i} on={profile.discipline === d.id} preview={{ kind: "discipline", id: d.id }} onPreview={onPreview} onPick={() => pickDiscipline(d.id)} icon={d.icon} />)}
                </div>
              </>
            )}

            {step === "destination" && (
              <>
                {prompt(copy.destination.prompt, copy.destination.hint)}
                <div role="group" aria-labelledby={promptId} className="mt-4 flex flex-wrap gap-2">
                  {destinations.map((d, i) => <Choice key={d.id} label={d.label} i={i} on={profile.destinations[0] === d.id} preview={{ kind: "destination", id: d.id }} onPreview={onPreview} onPick={() => pickDestination(d.id)} icon={"pin"} />)}
                  {<Choice key={DECIDE} label={copy.destination.decide} i={destinations.length} on={profile.openDestination} preview={{ kind: "destination", id: DECIDE }} onPreview={onPreview} onPick={() => pickDestination(DECIDE)} icon={"sparkles"} />}
                </div>
              </>
            )}

            {step === "intake" && (
              <>
                {prompt(copy.intake.prompt, copy.intake.hint)}
                <div role="group" aria-labelledby={promptId} className="mt-4 flex flex-wrap gap-2">
                  {intakes.map((o, i) => <Choice key={o.id} label={o.label} i={i} on={profile.intake === o.id} preview={{ kind: "intake", id: o.id }} onPreview={onPreview} onPick={() => pickIntake(o.id)} />)}
                </div>
              </>
            )}

            {step === "priorities" && (
              <>
                {prompt(copy.priorities.prompt, copy.priorities.hint)}
                <div role="group" aria-labelledby={promptId} className="mt-4 flex flex-wrap gap-2">
                  {priorities.map((o, i) => <Choice key={o.id} label={o.label} i={i} on={profile.priorities.includes(o.id)} preview={{ kind: "priority", id: o.id }} onPreview={onPreview} onPick={() => togglePriority(o.id)} icon={o.icon} muted={!profile.priorities.includes(o.id) && profile.priorities.length >= MAX_PRIORITIES} />)}
                </div>
                <p role="status" className="mt-2 min-h-5 text-sm font-medium text-sky">{notice}</p>
                <Button type="button" variant="coral" arrow className="mt-2" onClick={revealWorld}>{copy.reveal}</Button>
              </>
            )}

            {step === "result" && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky/80">{copy.result.eyebrow}</p>
                <h2 id="journey-title" ref={focusPrompt} tabIndex={-1} className="mt-2 text-[clamp(1.6rem,4.6vw,2.6rem)] leading-[1.08] text-ivory outline-none">
                  {formula.map((part, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-coral"> + </span>}
                      <span className="whitespace-nowrap">{part.text}{part.suggested && <sup aria-hidden className="text-coral">*</sup>}</span>
                    </span>
                  ))}
                </h2>
                <p className="mt-2 text-sm text-ivory/75">
                  {copy.result.lede}
                  {formula.some((p) => p.suggested) && <> <span className="text-coral">*</span> {copy.result.suggested}.</>}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <Button type="button" variant="coral" magnetic arrow onClick={onBestFit}>{copy.result.primary}</Button>
                  <Button type="button" variant="secondary" onClick={onCounsellor}>{copy.result.secondary}</Button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <DemoBadge>Illustrative</DemoBadge>
                  <button type="button" onClick={() => go("course")} className="inline-flex min-h-11 items-center gap-2 text-sm text-ivory/75 hover:text-ivory">
                    <RotateCcw aria-hidden className="size-4" /> {copy.result.restart}
                  </button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ivory/60">{copy.result.disclaimer}</p>
              </>
            )}

            {PREV[step] && step !== "result" && (
              <button type="button" onClick={() => go(PREV[step]!)} className="mt-3 inline-flex min-h-11 items-center gap-2 pr-3 text-sm text-ivory/75 hover:text-ivory">
                <ArrowLeft aria-hidden className="size-4" /> {copy.back}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
