"use client";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { shortlistCopy, stageById } from "@/data/journey/config";
import { profileMeta, track } from "@/lib/journey/analytics";
import { evaluateList, shortlistSummary } from "@/lib/journey/shortlist";
import { journey, useJourney, useJourneyReady } from "@/lib/journey/store";
import { SHORTLIST_STEPS, type Application, type ShortlistStep } from "@/lib/journey/types";
import { shortlistWorld, type Preview } from "@/lib/journey/worlds";
import { LeadForm } from "../ui/LeadForm";
import { Modal } from "../ui/Modal";
import { ThoughtPanel } from "./HeadWindow";
import { JourneyBar } from "./JourneyBar";
import { ShortlistQuestions } from "./shortlist/ShortlistQuestions";
import { ShortlistResults } from "./shortlist/ShortlistResults";
import { useJourneyStep } from "./useJourneyStep";

const cfg = stageById.shortlisting;
const RESULTS: ShortlistStep[] = ["reveal", "compare", "finalise"];

/**
 * The Shortlisting stage page: "I have options" → "I know which universities
 * to pursue". Course → Countries → Intake → Academic fit → Priorities →
 * Universities in mind? → reveal (ambitious / target / safe) → Compare →
 * Finalise → application plan. The thought panel tracks the narrowing:
 * too many options, filter, compare, rank, commit.
 */
export function ShortlistScreen() {
  const ready = useJourneyReady();
  const { profile } = useJourney();
  const router = useRouter();
  const [step, setStep] = useJourneyStep("shortlisting", SHORTLIST_STEPS);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [talk, setTalk] = useState(false);
  const closeTalk = useCallback(() => setTalk(false), []);

  const moved = useRef(false);
  const onStep = useCallback((s: ShortlistStep) => { moved.current = true; setStep(s); }, [setStep]);
  /** After a step change, focus lands on the new prompt so it is announced. */
  const focusRef = useCallback((el: HTMLHeadingElement | null) => { if (el && moved.current) el.focus(); }, []);

  const list = useMemo(() => evaluateList(profile.shortlist, profile), [profile]);
  const world = useMemo(() => shortlistWorld(step, preview, profile, list, compareIds), [step, preview, profile, list, compareIds]);
  const results = RESULTS.includes(step);

  /**
   * Shortlist → applying: one application record per shortlisted university
   * (keeping any already tracked), then straight to their statuses — the
   * student is never asked again which universities they're applying to.
   */
  const startApplications = () => {
    const p = journey.get().profile;
    const tracked = new Set(p.applications.map((a) => a.university));
    const added: Application[] = p.shortlist.filter((id) => !tracked.has(id)).map((id) => ({ university: id, status: "notStarted", pending: [], dates: {} }));
    journey.patch({ applications: [...p.applications, ...added] });
    journey.setStage("applying");
    track("shortlist_completed", { ...profileMeta(p, "shortlisting"), universities: p.shortlist });
    track("shortlist_finalised", { ...profileMeta(p, "shortlisting"), universities: p.shortlist });
    track("journey_stage_selected", { ...profileMeta(p, "applying"), from: "shortlisting", source: "shortlist-final" });
    router.push("/journey/applying?step=status");
  };

  if (!ready) return null;

  return (
    <>
      <div className="lg:col-span-6 lg:row-start-1 lg:self-end">
        <JourneyBar />
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky/80">{cfg.arc} · {cfg.mood}</p>
      </div>

      <div className={`lg:col-span-6 lg:col-start-7 lg:row-start-1 ${results ? "lg:self-end" : "lg:row-span-2 lg:self-center"}`}>
        <ThoughtPanel world={world} />
      </div>

      <div className={results ? "lg:col-span-12 lg:row-start-2" : "lg:col-span-6 lg:row-start-2 lg:self-start"}>
        {results ? (
          <ShortlistResults
            step={step as "reveal" | "compare" | "finalise"}
            profile={profile}
            list={list}
            compareIds={compareIds.filter((id) => profile.shortlist.includes(id))}
            onCompareIds={setCompareIds}
            onStep={onStep}
            onPreview={setPreview}
            focusRef={focusRef}
            onPlan={startApplications}
            onCounsellor={() => {
              track("counsellor_cta_clicked", { ...profileMeta(journey.get().profile, "shortlisting"), source: "shortlist-final" });
              setTalk(true);
            }}
          />
        ) : (
          <ShortlistQuestions profile={profile} step={step} onStep={onStep} onPreview={setPreview} focusRef={focusRef} />
        )}
      </div>

      <Modal open={talk} onClose={closeTalk} title={shortlistCopy.finalise.modal} gate>
        <LeadForm compact context={shortlistSummary(profile.shortlist)} />
      </Modal>
    </>
  );
}
