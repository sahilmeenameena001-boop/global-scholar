"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { exploringCopy, stageById } from "@/data/journey/config";
import type { NextAction } from "@/lib/journey/applying";
import type { Evaluated } from "@/lib/journey/shortlist";
import type { ApplyStep, OfferStep, ShortlistStep, Stage, UserProfile } from "@/lib/journey/types";
import type { Preview } from "@/lib/journey/worlds";
import { ApplyingQuestions } from "./applying/ApplyingQuestions";
import { ApplyingResults } from "./applying/ApplyingResults";
import { MoveDashboard } from "./offer/MoveDashboard";
import { OfferQuestions } from "./offer/OfferQuestions";
import { ShortlistQuestions } from "./shortlist/ShortlistQuestions";
import { ShortlistResults } from "./shortlist/ShortlistResults";

/** Steps whose content is too wide to sit beside the head; they open as a panel beneath it instead. */
const WIDE = new Set(["reveal", "compare", "finalise"]);

/** Beside the film on desktop, exactly where Exploring's questions sit. */
const BESIDE_CLS = "mt-5 lg:absolute lg:left-[calc(50%+28.125svh+2rem)] lg:top-1/2 lg:mt-0 lg:max-h-[calc(100svh-9rem)] lg:w-[min(27rem,calc(50%-28.125svh-4rem))] lg:-translate-y-1/2 lg:overflow-y-auto lg:pr-2";
/** Beneath the open head on desktop: the head stays in view while the details scroll. */
const BENEATH_CLS = "mt-5 lg:absolute lg:inset-x-[4%] lg:bottom-4 lg:top-[57%] lg:mt-0 lg:overflow-y-auto lg:rounded-3xl lg:bg-matte/95 lg:p-6 lg:shadow-lift lg:ring-1 lg:ring-ivory/10 lg:backdrop-blur-md";

type Props = {
  stage: Exclude<Stage, "exploring">;
  step: string;
  profile: UserProfile;
  today: string;
  list: Evaluated[];
  action: NextAction | null;
  compareIds: string[];
  onCompareIds: (ids: string[]) => void;
  onStep: (s: string) => void;
  onPreview: (p: Preview | null) => void;
  onUnlock: () => void;
  onCounsellor: (source: string) => void;
  /** Hand the student on to another state, inside the same head. */
  onSwitch: (to: Stage, step?: string) => void;
  /** Shortlist → application plan: create the applications, then move on. */
  onPlan: () => void;
  focusRef: (el: HTMLHeadingElement | null) => void;
};

/**
 * Shortlisting, Applying and Offer, run inside the home film's head exactly
 * like Exploring: the chosen state locks into a card beside the head, the
 * questions sit opposite, and every answer reshapes what the head shows.
 */
export function InHeadStage(props: Props) {
  const { stage, step, profile, today, onStep, onPreview, onUnlock, onCounsellor, focusRef } = props;
  const cfg = stageById[stage];
  const wide = WIDE.has(step) || (stage === "offer" && step === "acceptance" && profile.offers.length > 1);

  return (
    <>
      {/* the locked state — the card the student picked, with a way back to the four */}
      <div className={`lg:absolute lg:right-[calc(50%+28.125svh+2rem)] lg:top-[24%] lg:w-[15rem] ${wide ? "lg:top-[12%]" : ""}`}>
        <motion.div
          layoutId={`stage-${stage}`}
          className="flex items-center justify-between gap-3 rounded-[4px] bg-ivory py-2 pl-4 pr-1.5 text-ink shadow-lift lg:flex-col lg:items-start lg:p-4"
        >
          <span>
            <span className="block font-hand text-base leading-none opacity-70">{cfg.arc} · {exploringCopy.locked}</span>
            <span className="block font-serif text-base font-semibold leading-tight lg:text-lg">{cfg.cta}</span>
          </span>
          <button type="button" onClick={onUnlock} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-ink/70 hover:bg-ink/5 hover:text-ink lg:-ml-3">
            <X aria-hidden className="size-3.5" /> {exploringCopy.change}
          </button>
        </motion.div>
      </div>

      <div data-lenis-prevent className={wide ? BENEATH_CLS : BESIDE_CLS}>
        {stage === "shortlisting" && (["reveal", "compare", "finalise"].includes(step) ? (
          <ShortlistResults
            step={step as "reveal" | "compare" | "finalise"}
            profile={profile}
            list={props.list}
            compareIds={props.compareIds.filter((id) => profile.shortlist.includes(id))}
            onCompareIds={props.onCompareIds}
            onStep={onStep}
            onPreview={onPreview}
            focusRef={focusRef}
            onPlan={props.onPlan}
            onCounsellor={() => onCounsellor("shortlist-final")}
          />
        ) : (
          <ShortlistQuestions profile={profile} step={step as ShortlistStep} onStep={onStep} onPreview={onPreview} focusRef={focusRef} />
        ))}

        {stage === "applying" && (step === "dashboard" || step === "next" ? (
          <ApplyingResults
            step={step as "dashboard" | "next"}
            profile={profile}
            today={today}
            action={props.action}
            onStep={onStep as (s: ApplyStep) => void}
            focusRef={focusRef}
            onPlanMove={() => props.onSwitch("offer")}
            onCounsellor={() => onCounsellor(`applying-${step}`)}
          />
        ) : (
          <ApplyingQuestions profile={profile} step={step as Exclude<ApplyStep, "dashboard" | "next">} today={today} onStep={onStep} onPreview={onPreview} focusRef={focusRef} />
        ))}

        {stage === "offer" && (step === "move" ? (
          <MoveDashboard profile={profile} today={today} onCounsellor={() => onCounsellor("move")} onStep={onStep as (s: OfferStep) => void} focusRef={focusRef} />
        ) : (
          <OfferQuestions profile={profile} step={step as Exclude<OfferStep, "move">} today={today} onStep={onStep} onCounsellor={onCounsellor} focusRef={focusRef} />
        ))}
      </div>
    </>
  );
}
