import { VideoIntro } from "@/components/journey/VideoIntro";

/**
 * Home is a single question: "What's on your mind?" The film opens the head,
 * and the four answers each open their own full-screen stage page.
 *
 * The earlier hook sections (`Hero`, `Explore`, `BoardingPass`) are kept in
 * `components/sections` but no longer rendered here.
 */
export default function Home() {
  return <VideoIntro />;
}
