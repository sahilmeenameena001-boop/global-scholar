"use client";
import { useEffect, useState } from "react";
import { STAGE_BEATS, STAGE_STILL } from "@/lib/journey/scenes";
import type { Stage } from "@/lib/journey/types";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * A stage's scene clock. Shortlisting snaps into order after one beat,
 * applying moves a document per beat, an offer settles after one. Each visit
 * replays from the start; under reduced motion the stage shows its settled
 * frame straight away and no timers run.
 */
export function useStagePhase(stage: Stage | null, every = 1500) {
  const reduce = useReducedMotion();
  const [clock, setClock] = useState<{ stage: Stage | null; n: number }>({ stage: null, n: 0 });

  useEffect(() => {
    if (!stage || reduce || !STAGE_BEATS[stage]) return;
    const beats = STAGE_BEATS[stage];
    let n = 0;
    // restart from the overwhelm on every visit, then advance a beat at a time
    const reset = window.setTimeout(() => setClock({ stage, n: 0 }), 0);
    const id = window.setInterval(() => {
      n += 1;
      setClock({ stage, n });
      if (n >= beats) window.clearInterval(id);
    }, every);
    return () => { window.clearTimeout(reset); window.clearInterval(id); };
  }, [stage, reduce, every]);

  if (!stage) return 0;
  if (reduce) return STAGE_STILL[stage];
  return clock.stage === stage ? clock.n : 0;
}
