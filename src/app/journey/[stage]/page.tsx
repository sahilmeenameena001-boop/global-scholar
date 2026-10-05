import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplyingScreen } from "@/components/journey/ApplyingScreen";
import { ExploringScreen } from "@/components/journey/ExploringScreen";
import { HeadMediaProvider } from "@/components/journey/media/HeadMediaProvider";
import { OfferScreen } from "@/components/journey/OfferScreen";
import { ShortlistScreen } from "@/components/journey/ShortlistScreen";
import { StageScreen } from "@/components/journey/StageScreen";
import { stageById } from "@/data/journey/config";
import { findBackground } from "@/lib/journey/backgrounds";
import { scanHeadMedia } from "@/lib/journey/media.server";
import { STAGES, type Stage } from "@/lib/journey/types";

/** Exactly four stage pages; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return STAGES.map((stage) => ({ stage }));
}

export async function generateMetadata({ params }: { params: Promise<{ stage: string }> }): Promise<Metadata> {
  const { stage } = await params;
  const cfg = stageById[stage as Stage];
  return { title: cfg.cta, description: cfg.lede };
}

const SCREENS: Record<Stage, () => React.ReactNode> = {
  exploring: () => <ExploringScreen />,
  shortlisting: () => <ShortlistScreen />,
  applying: () => <ApplyingScreen />,
  offer: () => <OfferScreen />,
};

/**
 * Each journey stage is its own full-screen view with its own background —
 * a photo dropped into `public/global-scholar/<stage>/` (see
 * `lib/journey/backgrounds.ts`), or a drawn gradient until one is added.
 * The step lives in the URL (`?step=`), so the screen renders inside Suspense.
 */
export default async function Page({ params }: { params: Promise<{ stage: string }> }) {
  const stage = (await params).stage as Stage;
  return (
    <StageScreen stage={stage} background={findBackground(stage)}>
      <HeadMediaProvider media={scanHeadMedia()}>
        <Suspense fallback={null}>{SCREENS[stage]()}</Suspense>
      </HeadMediaProvider>
    </StageScreen>
  );
}
