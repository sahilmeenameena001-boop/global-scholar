import { VideoIntro } from "@/components/journey/VideoIntro";
import { BoardingPass } from "@/components/sections/BoardingPass";
import { Explore } from "@/components/sections/Explore";
import { isStage } from "@/lib/journey/types";

/**
 * Home opens on a single question: "What's on your mind?" The film is the
 * hero — it opens the head, and all four answers run right there, inside the
 * same head. Below it, the site continues as before: the chapter index and
 * the boarding-pass call to action.
 * `?state=<stage>` (optionally `&step=<step>`) skips the film and opens that
 * state straight away — links back into a state, and the old
 * `/journey/<stage>` addresses, use it.
 *
 * The earlier globe hero (`Hero`) is kept in `components/sections` but no
 * longer rendered: the film replaces it.
 */
export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  // `?explore=1` is the older form of `?state=exploring`
  const raw = typeof q.state === "string" ? q.state : "explore" in q ? "exploring" : null;
  const state = isStage(raw) ? raw : null;
  const step = state && typeof q.step === "string" ? q.step : null;
  return (
    <>
      {/* Hero: the film and its four states */}
      <VideoIntro key={`${state ?? "intro"}-${step ?? ""}`} initialState={state} initialStep={step} />
      {/* The index: one card per chapter, each its own route */}
      <Explore />
      {/* Climax CTA */}
      <BoardingPass />
    </>
  );
}
