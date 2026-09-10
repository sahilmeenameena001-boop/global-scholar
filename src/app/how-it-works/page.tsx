import type { Metadata } from "next";
import { Journey } from "@/components/sections/Journey";
import { BoardingPass } from "@/components/sections/BoardingPass";
import { PageNav } from "@/components/ui/PageNav";

export const metadata: Metadata = {
  title: "How It Works",
  description: "The six stages of a study-abroad application, from profile assessment to the pre-departure briefing.",
};

export default function Page() {
  return (
    <>
      <Journey />
      <BoardingPass />
      <PageNav current="/how-it-works" />
    </>
  );
}
