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

/** Every state runs inside the home film's head now; these addresses open it there, keeping any step. */
export default async function Page({ params, searchParams }: {
  params: Promise<{ stage: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { stage } = await params;
  const { step } = await searchParams;
  redirect(`/?state=${stage}${typeof step === "string" ? `&step=${encodeURIComponent(step)}` : ""}`);
}
