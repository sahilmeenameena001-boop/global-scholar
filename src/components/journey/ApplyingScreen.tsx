"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { applyingCopy, helpOptions, stageById } from "@/data/journey/config";
import { profileMeta, track } from "@/lib/journey/analytics";
import { applicationsSummary, nextAction, todayISO } from "@/lib/journey/applying";
import { journey, useJourney, useJourneyReady } from "@/lib/journey/store";
import { APPLY_STEPS, type ApplyStep } from "@/lib/journey/types";
import { applyWorld, type Preview } from "@/lib/journey/worlds";
import { LeadForm } from "../ui/LeadForm";
import { Modal } from "../ui/Modal";
import { ApplyingQuestions } from "./applying/ApplyingQuestions";
import { ApplyingResults } from "./applying/ApplyingResults";
import { ThoughtPanel } from "./HeadWindow";
import { JourneyBar } from "./JourneyBar";
import { useGoToStage } from "./useGoToStage";
import { useJourneyStep } from "./useJourneyStep";

const cfg = stageById.applying;
const RESULTS: ApplyStep[] = ["dashboard", "next"];

/**
 * The Applying stage page: "I've started applications" → "I know what is
 * pending, by when, and what to do next". Universities → Status → Pending →
 * Deadlines → Help → Dashboard → Next best action. The thought panel follows
 * scattered applications into an organised tracker, then a clear deadline
 * line, then one next action.
 */
export function ApplyingScreen() {
  const ready = useJourneyReady();
  const { profile } = useJourney();
  const [step, setStep] = useJourneyStep("applying", APPLY_STEPS);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [talk, setTalk] = useState(false);
  // the date the student is looking from; fixed for the visit so counts don't shift mid-task
  const [today] = useState(() => todayISO());
  const closeTalk = useCallback(() => setTalk(false), []);
  const { go } = useGoToStage("applying");

  const moved = useRef(false);
  const onStep = useCallback((s: ApplyStep) => { moved.current = true; setPreview(null); setStep(s); }, [setStep]);
  const focusRef = useCallback((el: HTMLHeadingElement | null) => { if (el && moved.current) el.focus(); }, []);

  const action = useMemo(() => nextAction(profile.applications, today), [profile.applications, today]);
  const world = useMemo(() => applyWorld(step, preview, profile, today, action), [step, preview, profile, today, action]);
  const results = RESULTS.includes(step);

  const help = profile.helpNeeded.filter((h) => h !== "none").map((h) => helpOptions.find((o) => o.id === h)!.short);
  const context = `${applicationsSummary(profile.applications, today)}${help.length ? `. Help: ${help.join(", ")}` : ""}`.slice(0, 200);

  if (!ready) return null;

  return (
    <>
      <div className="lg:col-span-6 lg:row-start-1 lg:self-end">
        <JourneyBar />
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky/80">{cfg.arc} · {cfg.mood}</p>
      </div>

      <div className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:self-center">
        <ThoughtPanel world={world} />
      </div>

      <div className="lg:col-span-6 lg:row-start-2 lg:self-start">
        {results ? (
          <ApplyingResults
            step={step as "dashboard" | "next"}
            profile={profile}
            today={today}
            action={action}
            onStep={onStep}
            focusRef={focusRef}
            onPlanMove={() => go("offer", "applying-decision")}
            onCounsellor={() => {
              track("counsellor_cta_clicked", { ...profileMeta(journey.get().profile, "applying"), source: `applying-${step}` });
              setTalk(true);
            }}
          />
        ) : (
          <ApplyingQuestions profile={profile} step={step as Exclude<ApplyStep, "dashboard" | "next">} today={today} onStep={onStep} onPreview={setPreview} focusRef={focusRef} />
        )}
      </div>

      <Modal open={talk} onClose={closeTalk} title={applyingCopy.next.modal} gate>
        <LeadForm compact context={context} />
      </Modal>
    </>
  );
}
