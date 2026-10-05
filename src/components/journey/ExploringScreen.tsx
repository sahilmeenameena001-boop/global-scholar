"use client";
import { useCallback, useMemo, useState } from "react";
import { exploringCopy, stageById } from "@/data/journey/config";
import { profileMeta, track } from "@/lib/journey/analytics";
import { explorationSummary } from "@/lib/journey/explore";
import { journey, useJourney, useJourneyReady } from "@/lib/journey/store";
import { EXPLORING_STEPS } from "@/lib/journey/types";
import { exploringWorld, type Preview } from "@/lib/journey/worlds";
import { LeadForm } from "../ui/LeadForm";
import { Modal } from "../ui/Modal";
import { ExploreFunnel } from "./ExploreFunnel";
import { Discover } from "./explore/Discover";
import { ThoughtPanel } from "./HeadWindow";
import { JourneyBar } from "./JourneyBar";
import { SavePlanPrompt } from "./SavePlanPrompt";
import { useGoToStage } from "./useGoToStage";
import { useJourneyStep } from "./useJourneyStep";

const cfg = stageById.exploring;

/**
 * The Exploring stage page: Course → Destination → Intake → Priorities →
 * personalised result, then universities worth exploring. The step lives in
 * the URL (Back walks through the questions) and in the store (a return visit
 * resumes). The thought panel previews every hover and keeps every pick.
 */
export function ExploringScreen() {
  const ready = useJourneyReady();
  const { profile } = useJourney();
  const [step, setStep] = useJourneyStep("exploring", EXPLORING_STEPS);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [talk, setTalk] = useState(false);
  const closeTalk = useCallback(() => setTalk(false), []);
  const { go } = useGoToStage("exploring");

  const world = useMemo(() => exploringWorld(step, preview, profile), [step, preview, profile]);

  // wait for saved answers so the right step mounts first instead of animating across
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
        <ExploreFunnel
          profile={profile}
          step={step}
          onStep={setStep}
          onPreview={setPreview}
          onBestFit={() => {
            track("stage_cta_clicked", { ...profileMeta(journey.get().profile, "exploring"), cta: "best-fit" });
            go("shortlisting", "explore-result");
          }}
          onCounsellor={() => {
            track("counsellor_cta_clicked", { ...profileMeta(journey.get().profile, "exploring"), source: "explore-result" });
            setTalk(true);
          }}
        />
      </div>

      {step === "result" && (
        <div className="space-y-10 lg:col-span-12 lg:row-start-3">
          <Discover profile={profile} />
          <div className="max-w-2xl">
            <SavePlanPrompt context={explorationSummary(profile)} source="explore-result" />
          </div>
        </div>
      )}

      <Modal open={talk} onClose={closeTalk} title={exploringCopy.result.modal} gate>
        <LeadForm compact context={explorationSummary(profile)} onSuccess={() => {
          journey.patch({ leadCaptured: true });
          track("lead_created", { ...profileMeta(journey.get().profile, "exploring"), source: "explore-counsellor" });
        }} />
      </Modal>
    </>
  );
}
