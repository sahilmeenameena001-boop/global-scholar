"use client";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { profileMeta, track } from "@/lib/journey/analytics";
import { firstOpenStep } from "@/lib/journey/lifecycle";
import { journey } from "@/lib/journey/store";
import type { Stage } from "@/lib/journey/types";

/**
 * The current step of a stage page, kept in the URL (`?step=destination`) so
 * the browser's Back button walks back through the questions instead of
 * leaving the site, and kept in the journey store so a returning student
 * picks up where they left off rather than starting again.
 *
 * Order of truth: the URL, then the last step saved for this stage, then the
 * first step the student hasn't answered yet. The fallback is worked out once,
 * when the page opens — answering a question never moves the page by itself;
 * only explicit navigation (Continue, Back, a link) changes the step.
 *
 * Screens call this after the journey store is ready, so the saved copy is
 * what the fallback is computed from.
 *
 * Uses `useSearchParams`, so the page renders it inside a Suspense boundary.
 */
export function useJourneyStep<S extends string>(stage: Stage, steps: readonly S[]) {
  const params = useSearchParams();
  const valid = (v: string | null | undefined): v is S => !!v && (steps as readonly string[]).includes(v);
  const [fallback] = useState<S>(() => {
    const p = journey.get();
    const resume = p.steps[stage];
    const open = firstOpenStep(stage, p.profile);
    return valid(resume) ? resume : valid(open) ? open : steps[0];
  });

  const fromUrl = params.get("step");
  const step: S = valid(fromUrl) ? fromUrl : fallback;

  const setStep = useCallback((next: S) => {
    const q = new URLSearchParams(window.location.search);
    q.set("step", next);
    // native pushState is synced with the Next router and `useSearchParams`
    window.history.pushState(null, "", `?${q.toString()}`);
    journey.setStep(stage, next);
    track("journey_step_view", { ...profileMeta(journey.get().profile, stage), step: next });
  }, [stage]);

  return [step, setStep] as const;
}
