import { BoardingPass } from "@/components/sections/BoardingPass";
import { Explore } from "@/components/sections/Explore";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <>
      {/* Hook */}
      <Hero />
      {/* The index: one card per chapter, each its own route */}
      <Explore />
      {/* Climax CTA */}
      <BoardingPass />
    </>
  );
}
