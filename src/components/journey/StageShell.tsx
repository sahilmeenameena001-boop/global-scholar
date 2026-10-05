"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCallback, useState } from "react";
import { shellCopy, stageById } from "@/data/journey/config";
import { profileMeta, track } from "@/lib/journey/analytics";
import { answerLabels } from "@/lib/journey/explore";
import { journey, useJourney } from "@/lib/journey/store";
import type { Stage } from "@/lib/journey/types";
import { Button } from "../ui/Button";
import { LeadForm } from "../ui/LeadForm";
import { Modal } from "../ui/Modal";
import { Aside, Eyebrow, JourneyControls, JourneyHead } from "./Frame";
import { JourneyProgress } from "./JourneyProgress";

/**
 * Entry screen for a stage whose step-by-step flow ships in a later
 * milestone. The head already behaves like the stage — shortlisting snaps,
 * applying runs its pipeline, an offer settles — and both CTAs lead somewhere
 * real: an honest note about what is coming and a counsellor who can do it now.
 */
export function StageShell({ stage, onStage }: { stage: Exclude<Stage, "exploring">; onStage: (s: Stage, source: string) => void }) {
  const cfg = stageById[stage];
  const { profile } = useJourney();
  const [chosen, setChosen] = useState<string | null>(null);
  const [talk, setTalk] = useState(false);
  const closeTalk = useCallback(() => setTalk(false), []);

  const a = answerLabels(profile);
  const carried = [a.interest, a.destination === "compare" ? null : a.destination, a.intake].filter(Boolean) as string[];

  const pick = (cta: "primary" | "secondary") => {
    const label = cta === "primary" ? cfg.primary : cfg.secondary;
    track("stage_cta_clicked", { ...profileMeta(journey.get().profile, stage), cta, label });
    setChosen(label);
  };

  return (
    <>
      <JourneyHead>
        <JourneyProgress current={stage} />
      </JourneyHead>

      <JourneyControls>
        <Eyebrow>{cfg.arc} · {cfg.mood}</Eyebrow>
        <h1 id="journey-title" className="over-canvas mt-3 text-[clamp(1.85rem,5.6vw,3rem)] leading-[1.02] text-ivory">{cfg.title}</h1>
        <Aside>{cfg.lede}</Aside>

        {carried.length > 0 && (
          <p className="mt-4 text-sm text-mist">
            <span className="text-faint">{shellCopy.carry}: </span>{carried.join(" · ")}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Button type="button" magnetic arrow aria-expanded={chosen === cfg.primary} onClick={() => pick("primary")}>{cfg.primary}</Button>
          <Button type="button" variant="secondary" aria-expanded={chosen === cfg.secondary} onClick={() => pick("secondary")}>{cfg.secondary}</Button>
        </div>

        <AnimatePresence>
          {chosen && cfg.preview && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 16, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: -0.5 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative mt-6 rounded-[4px] bg-ivory p-5 text-ink shadow-lift"
            >
              <span aria-hidden className="absolute -top-2 left-8 h-4 w-14 -rotate-3 bg-royal-lit/40" />
              <p role="status" className="font-hand text-xl leading-snug">{cfg.preview.note}</p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/60">{shellCopy.covers}</p>
              <ol className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm font-semibold">
                {cfg.preview.steps.map((s, i) => (
                  <li key={s} className="flex items-center gap-1.5">
                    <span className="rounded-full bg-ink/[0.07] px-2.5 py-1">{s}</span>
                    {i < cfg.preview!.steps.length - 1 && <ArrowRight aria-hidden className="size-3 text-ink/40" />}
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button type="button" variant="coral" arrow onClick={() => { track("counsellor_cta_clicked", { ...profileMeta(journey.get().profile, stage), source: `${stage}-preview` }); setTalk(true); }}>
                  {shellCopy.counsellor}
                </Button>
                <button type="button" onClick={() => onStage("exploring", `${stage}-preview`)} className="min-h-11 rounded-full px-3 text-sm font-semibold text-royal underline-offset-4 hover:underline">
                  {shellCopy.explore}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </JourneyControls>

      <Modal open={talk} onClose={closeTalk} title={shellCopy.modal} gate>
        <LeadForm compact context={`${cfg.enquiry}${chosen ? ` (${chosen})` : ""}`} />
      </Modal>
    </>
  );
}
