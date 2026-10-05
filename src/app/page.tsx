import { VideoIntro } from "@/components/journey/VideoIntro";

/**
 * Home is a single question: "What's on your mind?" The film opens the head,
 * and the four answers lead into the journey. Exploring runs right here, in
 * the same head; `?explore=1` (used by links back into Exploring from other
 * stages) skips the film and opens it straight away.
 *
 * The earlier hook sections (`Hero`, `Explore`, `BoardingPass`) are kept in
 * `components/sections` but no longer rendered here.
 */
export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const explore = "explore" in (await searchParams);
  return <VideoIntro key={explore ? "explore" : "intro"} startExploring={explore} />;
}
