import { HomeExperience } from "@/components/journey/home/HomeExperience";
import { HeadMediaProvider } from "@/components/journey/media/HeadMediaProvider";
import { scanHeadMedia } from "@/lib/journey/media.server";

/**
 * Home is stage-aware. A first visit opens on the film and its question,
 * "What's on your mind?"; a returning student lands on their own journey.
 * Head media found in `public/global-scholar/head/` is handed to the client
 * here, at build time.
 *
 * The earlier hook sections (`Hero`, `Explore`, `BoardingPass`) are kept in
 * `components/sections` but no longer rendered here.
 */
export default function Home() {
  return (
    <HeadMediaProvider media={scanHeadMedia()}>
      <HomeExperience />
    </HeadMediaProvider>
  );
}
