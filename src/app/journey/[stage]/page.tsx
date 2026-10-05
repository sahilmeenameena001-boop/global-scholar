import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { stageById } from "@/data/journey/config";
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
 * The stage itself is rendered by the journey layout, which keeps the head
 * mounted across stages. Exploring runs inside the home-page film instead.
 */
export default async function Page({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  if (stage === "exploring") redirect("/?explore=1");
  return null;
}
