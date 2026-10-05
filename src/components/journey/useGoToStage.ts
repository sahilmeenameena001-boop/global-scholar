"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { profileMeta, track } from "@/lib/journey/analytics";
import { journey } from "@/lib/journey/store";
import type { Stage } from "@/lib/journey/types";

/** Every stage is its own full-screen page. */
export const stageHref = (s: Stage) => `/journey/${s}`;

/**
 * Moves the student into a journey stage: records the choice, fires the
 * analytics, then routes to `/journey/<stage>`. Shared by the home-page intro
 * and every in-journey stage switch so they can never drift apart.
 */
export function useGoToStage(from: Stage | null) {
  const router = useRouter();

  const go = useCallback((next: Stage, source: string) => {
    const current = journey.get().profile;
    if (!current.journeyStage) track("journey_started", { ...profileMeta(current, next), source });
    track("journey_selected", { ...profileMeta(current, next), from, source });
    track("journey_stage_selected", { ...profileMeta(current, next), from, source });
    journey.setStage(next);
    router.push(stageHref(next));
  }, [router, from]);

  /** Warm only the route the student is reaching for — on hover or focus. */
  const warm = useCallback((next: Stage) => router.prefetch(stageHref(next)), [router]);

  return { go, warm };
}
