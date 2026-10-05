import { VideoIntro } from "@/components/journey/VideoIntro";
import { isStage } from "@/lib/journey/types";

/**
 * Home is a single question: "What's on your mind?" The film opens the head,
 * and all four answers run right here, inside the same head.
 * `?state=<stage>` (optionally `&step=<step>`) skips the film and opens that
 * state straight away — links back into a state, and the old
 * `/journey/<stage>` addresses, use it.
 *
 * The earlier hook sections (`Hero`, `Explore`, `BoardingPass`) are kept in
 * `components/sections` but no longer rendered here.
 */
export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  // `?explore=1` is the older form of `?state=exploring`
  const raw = typeof q.state === "string" ? q.state : "explore" in q ? "exploring" : null;
  const state = isStage(raw) ? raw : null;
  const step = state && typeof q.step === "string" ? q.step : null;
  return <VideoIntro key={`${state ?? "intro"}-${step ?? ""}`} initialState={state} initialStep={step} />;
}
