"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { stageById } from "@/data/journey/config";
import { offerCopy } from "@/data/journey/offer";
import { profileMeta, track } from "@/lib/journey/analytics";
import { todayISO, uniName } from "@/lib/journey/applying";
import { lifecycleOf } from "@/lib/journey/lifecycle";
import { moveSummary } from "@/lib/journey/offer";
import { journey, useJourney, useJourneyReady } from "@/lib/journey/store";
import { OFFER_STEPS, type OfferStep } from "@/lib/journey/types";
import { offerWorld } from "@/lib/journey/worlds";
import { LeadForm } from "../ui/LeadForm";
import { Modal } from "../ui/Modal";
import { ThoughtPanel } from "./HeadWindow";
import { JourneyBar } from "./JourneyBar";
import { MoveDashboard } from "./offer/MoveDashboard";
import { OfferQuestions } from "./offer/OfferQuestions";
import { useJourneyStep } from "./useJourneyStep";

const cfg = stageById.offer;

/**
 * The Offer Received stage page, which becomes the departure workspace once
 * the student confirms their choice: offers → choose and accept → conditions
 * → visa → money → accommodation → travel → My Move. Celebration first, then
 * a focused checklist.
 */
export function OfferScreen() {
  const ready = useJourneyReady();
  const { profile } = useJourney();
  const [step, setStep] = useJourneyStep("offer", OFFER_STEPS);
  const [today] = useState(() => todayISO());
  const [talk, setTalk] = useState<string | null>(null);
  const closeTalk = useCallback(() => setTalk(null), []);

  const moved = useRef(false);
  const onStep = useCallback((s: OfferStep) => { moved.current = true; setStep(s); }, [setStep]);
  const focusRef = useCallback((el: HTMLHeadingElement | null) => { if (el && moved.current) el.focus(); }, []);
  const counsellor = (source: string) => {
    track("counsellor_cta_clicked", { ...profileMeta(journey.get().profile, "offer"), source });
    setTalk(source);
  };

  const world = useMemo(() => offerWorld(step, profile, today), [step, profile, today]);
  const stage = lifecycleOf(profile, today);
  const context = `Offer stage (${stage}): ${profile.offers.map((o) => uniName(o.university)).join(", ") || "no offers yet"}. ${moveSummary(profile).map((r) => `${r.label} ${r.value}`).join(", ")}`.slice(0, 200);

  if (!ready) return null;

  return (
    <>
      <div className="lg:col-span-6 lg:row-start-1 lg:self-end">
        <JourneyBar />
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky/80">{cfg.arc} · {stage === "departure" || stage === "arrival" ? "Departure" : cfg.mood}</p>
      </div>

      <div className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:self-center">
        <ThoughtPanel world={world} />
      </div>

      <div className="lg:col-span-6 lg:row-start-2 lg:self-start">
        {step === "move"
          ? <MoveDashboard profile={profile} today={today} onCounsellor={() => counsellor("move")} focusRef={focusRef} />
          : <OfferQuestions profile={profile} step={step} today={today} onStep={onStep} onCounsellor={counsellor} focusRef={focusRef} />}
      </div>

      <Modal open={!!talk} onClose={closeTalk} title={offerCopy.modal} gate>
        <LeadForm compact context={`${talk ? `[${talk}] ` : ""}${context}`.slice(0, 200)} onSuccess={() => {
          journey.patch({ leadCaptured: true });
          track("lead_created", { ...profileMeta(journey.get().profile, "offer"), source: talk ?? "offer" });
        }} />
      </Modal>
    </>
  );
}
