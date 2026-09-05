import { BoardingPass } from "@/components/sections/BoardingPass";
import { ChapterRail } from "@/components/ChapterRail";
import { Counsellors } from "@/components/sections/Counsellors";
import { Destinations } from "@/components/sections/Destinations";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Navbar } from "@/components/sections/Navbar";
import { Quiz } from "@/components/sections/Quiz";
import { Scholarships } from "@/components/sections/Scholarships";
import { Stories } from "@/components/sections/Stories";

export default function Home() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-royal focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      <Navbar />
      <ChapterRail />
      <main id="main">
        {/* Hook */}
        <Hero />
        {/* Chapter 1 — the problem: which country? */}
        <Destinations />
        {/* Chapter 2 — the match */}
        <Quiz />
        {/* Chapter 3 — the route */}
        <Journey />
        {/* Chapter 4 — paying for it */}
        <Scholarships />
        {/* Chapter 5 — arrival, the people, the climax CTA */}
        <Stories />
        <Counsellors />
        <BoardingPass />
      </main>
      <Footer />
    </>
  );
}
