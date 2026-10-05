"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarClock, Check } from "lucide-react";
import { useState } from "react";
import { actionGuides, applyingCopy as copy } from "@/data/journey/config";
import { homeCopy } from "@/data/journey/home";
import { profileMeta, track } from "@/lib/journey/analytics";
import { allDates, completeAction, deadlineLabel, headline, submittedCount, uniName, type NextAction } from "@/lib/journey/applying";
import { journey } from "@/lib/journey/store";
import type { ApplyStep, UserProfile } from "@/lib/journey/types";
import { Button } from "../../ui/Button";

const TONE: Record<ReturnType<typeof headline>["tone"], string> = {
  faint: "bg-white/10 text-ivory/80 ring-white/20",
  sky: "bg-sky/15 text-sky ring-sky/30",
  royal: "bg-royal/30 text-royal-lit ring-royal-lit/40",
  coral: "bg-coral/20 text-coral ring-coral/40",
  ivory: "bg-ivory/15 text-ivory ring-ivory/30",
};
const heading = "text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.05] text-ivory outline-none";
const back = "inline-flex min-h-11 items-center gap-2 pr-3 text-sm text-ivory/75 hover:text-ivory";
const meta = (extra = {}) => ({ ...profileMeta(journey.get().profile, "applying"), ...extra });

type Props = {
  step: Extract<ApplyStep, "dashboard" | "next">;
  profile: UserProfile;
  today: string;
  action: NextAction | null;
  onStep: (s: ApplyStep) => void;
  onCounsellor: () => void;
  onPlanMove: () => void;
  focusRef: (el: HTMLHeadingElement | null) => void;
};

/**
 * The tracker's payoff: every application on one dashboard, then the single
 * thing to do next. Marking that thing done updates the tracker, and the next
 * action takes its place.
 */
export function ApplyingResults({ step, profile, today, action, onStep, onCounsellor, onPlanMove, focusRef }: Props) {
  const apps = profile.applications;
  const done = submittedCount(apps);
  const upcoming = allDates(apps, today).filter((d) => d.days >= 0).slice(0, 3);

  if (!apps.length) {
    const e = homeCopy.empty.applications;
    return (
      <div>
        <h2 id="journey-title" ref={focusRef} tabIndex={-1} className={heading}>{e.text}</h2>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button href={e.href} arrow>{e.cta}</Button>
          <button type="button" onClick={() => onStep("universities")} className={back}>{copy.universities.search}</button>
        </div>
      </div>
    );
  }

  if (step === "dashboard") {
    return (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky/80">{copy.dashboard.eyebrow}</p>
        <h2 id="journey-title" ref={focusRef} tabIndex={-1} className={`mt-2 ${heading}`}>{copy.dashboard.progress(done, apps.length)}</h2>
        <div aria-hidden className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-royal-lit to-coral" initial={{ scaleX: 0 }} animate={{ scaleX: apps.length ? done / apps.length : 0 }} transition={{ type: "spring", stiffness: 90, damping: 20 }} />
        </div>

        <ul className="mt-6 space-y-2">
          {apps.map((a) => {
            const h = headline(a, today);
            return (
              <li key={a.university} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-void/45 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm">
                <span className="font-serif text-lg text-ivory">{uniName(a.university)}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${TONE[h.tone]}`}>
                  {h.urgent && <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-current" />}
                  {h.text}
                </span>
              </li>
            );
          })}
        </ul>

        {upcoming.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-ivory/85">{copy.dashboard.upcoming}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {upcoming.map((d) => (
                <li key={`${d.university}-${d.kind}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-void/45 px-3.5 text-xs font-semibold text-ivory ring-1 ring-inset ring-white/15">
                  <CalendarClock aria-hidden className={`size-4 ${d.days <= 14 ? "text-coral" : "text-sky"}`} />
                  {uniName(d.university)} · {deadlineLabel(d.kind)} · {copy.deadlines.days(d.days)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="button" variant="coral" arrow onClick={() => onStep("next")}>{copy.dashboard.next}</Button>
          <button type="button" onClick={() => onStep("help")} className={back}><ArrowLeft aria-hidden className="size-4" /> {copy.back}</button>
        </div>
        <p className="mt-6 max-w-[70ch] text-xs leading-relaxed text-ivory/60">{copy.disclaimer}</p>
      </div>
    );
  }

  return <Next action={action} today={today} profile={profile} onStep={onStep} onCounsellor={onCounsellor} onPlanMove={onPlanMove} focusRef={focusRef} />;
}

function Next({ action, onStep, onCounsellor, onPlanMove, focusRef }: Omit<Props, "step">) {
  const [open, setOpen] = useState(false);
  const [justDone, setJustDone] = useState(false);
  const n = copy.next;

  const markDone = () => {
    if (!action) return;
    journey.patch({ applications: completeAction(journey.get().profile.applications, action) });
    track(action.kind === "task" ? "document_completed" : "application_started", meta({ university: action.university, action: action.kind, task: action.task }));
    setOpen(false);
    setJustDone(true);
  };

  if (!action) return null;
  const canComplete = action.kind !== "wait" && action.kind !== "decision";

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky/80">{n.eyebrow}</p>
      <p role="status" className="mt-1 min-h-5 text-sm font-medium text-sky">{justDone ? n.doneNote : ""}</p>
      <h2 id="journey-title" ref={focusRef} tabIndex={-1} className={`mt-1 ${heading}`}>{action.label}</h2>
      <p className="mt-3 max-w-[60ch] text-ivory/85"><span className="font-semibold text-ivory">{n.why}: </span>{action.why}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {action.kind === "decision"
          ? <Button type="button" variant="coral" magnetic arrow onClick={onPlanMove}>{n.plan}</Button>
          : <Button type="button" variant="coral" magnetic arrow aria-expanded={open} onClick={() => { setOpen(!open); setJustDone(false); track("stage_cta_clicked", meta({ cta: "next-task", action: action.kind })); }}>{n.primary}</Button>}
        <Button type="button" variant="secondary" onClick={onCounsellor}>{n.secondary}</Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: -0.4 }} exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative mt-6 max-w-xl rounded-[4px] bg-ivory p-5 text-ink shadow-lift"
          >
            <span aria-hidden className="absolute -top-2 left-8 h-4 w-14 -rotate-3 bg-royal-lit/40" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/60">{n.howTo}</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
              {actionGuides[action.kind].map((line) => <li key={line}>{line}</li>)}
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {canComplete && (
                <button type="button" onClick={markDone} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-ivory hover:bg-ink/85">
                  <Check aria-hidden className="size-4" /> {n.done}
                </button>
              )}
              <button type="button" onClick={onCounsellor} className="min-h-11 rounded-full px-3 text-sm font-semibold text-royal underline-offset-4 hover:underline">{n.help}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <button type="button" onClick={() => onStep("dashboard")} className={back}><ArrowLeft aria-hidden className="size-4" /> {copy.back}</button>
      </div>
      <p className="mt-2 max-w-[70ch] text-xs leading-relaxed text-ivory/60">{copy.disclaimer}</p>
    </div>
  );
}
