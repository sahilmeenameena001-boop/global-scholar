import { VideoIntro } from "@/components/journey/VideoIntro";
import { BoardingPass } from "@/components/sections/BoardingPass";
import { Counsellors } from "@/components/sections/Counsellors";
import { Destinations } from "@/components/sections/Destinations";
import { Explore } from "@/components/sections/Explore";
import { Journey } from "@/components/sections/Journey";
import { Quiz } from "@/components/sections/Quiz";
import { Scholarships } from "@/components/sections/Scholarships";
import { Stories } from "@/components/sections/Stories";
import { isStage } from "@/lib/journey/types";

/**
 * Home opens on a single question: "What's on your mind?" The film is the
 * hero — it opens the head, and all four answers run right there, inside the
 * same head. Below it, the site tells its story as the original single page
 * did: the chapter index, then each chapter in turn — countries, the match,
 * the route, funding, arrivals, the counsellors — and the boarding pass.
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
      {/* Chapter 1 — which country? The countries sketchbook, deck or grid */}
      <Destinations />
      {/* Chapter 2 — the match */}
      <Quiz />
      {/* Chapter 3 — the route */}
      <Journey />
      {/* Chapter 4 — paying for it */}
      <Scholarships />
      {/* Chapter 5 — arrival, the people */}
      <Stories />
      <Counsellors />
      {/* Climax CTA */}
      <BoardingPass />
    </>
  );
}
