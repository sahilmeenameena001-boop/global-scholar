"use client";
import dynamic from "next/dynamic";
import { useSelectedLayoutSegment } from "next/navigation";
import { useMemo } from "react";
import { composeScene } from "@/lib/journey/scenes";
import { useJourney } from "@/lib/journey/store";
import { isStage } from "@/lib/journey/types";
import { FRAME_GRID } from "./Frame";
import { HeadExperience } from "./HeadExperience";
import { useGoToStage } from "./useGoToStage";
import { useStagePhase } from "./useStagePhase";

/*
 * Each stage's controls are a separate chunk, fetched only once the student
 * heads there. The head and its scene stay mounted throughout. Exploring is
 * not here: it runs inside the home-page film (`VideoIntro`).
 */
const StageShell = dynamic(() => import("./StageShell").then((m) => m.StageShell));

/**
 * The journey orchestrator, mounted by `app/journey/layout.tsx` so it
 * survives navigation between stages. The URL owns which stage is showing; the
 * journey store owns everything the student has told us; `composeScene` turns
 * both into the thoughts inside the head. The opening "What's on your mind?"
 * screen is the home-page film (`VideoIntro`), so a bare `/journey` redirects
 * there.
 */
export function ScholarJourney() {
  const segment = useSelectedLayoutSegment();
  const stage = isStage(segment) ? segment : null;
  const { profile, steps } = useJourney();
  const phase = useStagePhase(stage);
  const { go } = useGoToStage(stage);

  const scene = useMemo(() => composeScene(stage, steps, profile, phase), [stage, steps, profile, phase]);

  if (!stage || stage === "exploring") return null;

  return (
    <section aria-labelledby="journey-title" data-chapter={0} className="relative px-4 pb-20 pt-24 sm:px-8 lg:min-h-[100svh] lg:pt-28">
      <div className={`mx-auto max-w-7xl ${FRAME_GRID}`}>
        <StageShell key={stage} stage={stage} onStage={go} />

        <div className="[grid-area:scene] lg:self-center">
          <HeadExperience items={scene.items} profile={scene.motion} />
        </div>
      </div>
    </section>
  );
}
