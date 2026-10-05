import type { Metadata } from "next";
import { ExploringScreen } from "@/components/journey/ExploringScreen";
import { StageScreen } from "@/components/journey/StageScreen";
import { StageShell } from "@/components/journey/StageShell";
import { stageById } from "@/data/journey/config";
import { findBackground } from "@/lib/journey/backgrounds";
import { STAGES, type Stage } from "@/lib/journey/types";

/** Exactly four stages; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return STAGES.map((stage) => ({ stage }));
}

export async function generateMetadata({ params }: { params: Promise<{ stage: string }> }): Promise<Metadata> {
  const { stage } = await params;
  const cfg = stageById[stage as Stage];
  return { title: cfg.cta, description: cfg.lede };
}

/**
 * Each journey stage is its own full-screen view with its own background —
 * a photo dropped into `public/global-scholar/<stage>/` (see
 * `lib/journey/backgrounds.ts`), or a drawn gradient until one is added.
 */
export default async function Page({ params }: { params: Promise<{ stage: string }> }) {
  const stage = (await params).stage as Stage;
  return (
    <StageScreen stage={stage} background={findBackground(stage)}>
      {stage === "exploring" ? <ExploringScreen /> : <StageShell stage={stage} />}
    </StageScreen>
  );
}
