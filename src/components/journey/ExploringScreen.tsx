"use client";
import { useCallback, useMemo, useState } from "react";
import { exploringCopy, stageById } from "@/data/journey/config";
import { profileMeta, track } from "@/lib/journey/analytics";
import { explorationSummary } from "@/lib/journey/explore";
import { journey, useJourney } from "@/lib/journey/store";
import type { ExploringStep } from "@/lib/journey/types";
import { exploringWorld, type Preview } from "@/lib/journey/worlds";
import { LeadForm } from "../ui/LeadForm";
import { Modal } from "../ui/Modal";
import { ExploreFunnel } from "./ExploreFunnel";
import { ThoughtPanel } from "./HeadWindow";
import { JourneyProgress } from "./JourneyProgress";
import { useGoToStage } from "./useGoToStage";

const cfg = stageById.exploring;

/**
 * The Exploring stage page: Course → Destination → Intake → Priorities →
 * personalised reveal, over the stage's own background. The thought panel
 * previews every hover and keeps every pick. Answers persist; the questions
 * start from the top on each visit, already filled in.
 */
export function ExploringScreen() {
  const { profile } = useJourney();
  const [step, setStep] = useState<ExploringStep>("course");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [talk, setTalk] = useState(false);
  const closeTalk = useCallback(() => setTalk(false), []);
  const { go } = useGoToStage("exploring");

  const world = useMemo(() => exploringWorld(step, preview, profile), [step, preview, profile]);

  return (
    <>
      <div className="lg:col-span-6 lg:row-start-1 lg:self-end">
        <JourneyProgress current="exploring" />
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

      <Modal open={talk} onClose={closeTalk} title={exploringCopy.result.modal} gate>
        <LeadForm compact context={explorationSummary(profile)} />
      </Modal>
    </>
  );
}
