import type { Metadata } from "next";
import { ScholarJourney } from "@/components/journey/ScholarJourney";

export const metadata: Metadata = {
  title: "Your Journey",
  description: "Tell us what’s on your mind (exploring, shortlisting, applying or holding an offer) and see your study-abroad thoughts sorted into a plan.",
};

/**
 * The journey lives in the layout so the open head stays mounted while the
 * student moves between `/journey` and `/journey/<stage>`: thoughts
 * reorganise in place instead of the page reloading. The pages below only
 * carry metadata; `ScholarJourney` reads the active stage from the URL.
 */
export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScholarJourney />
      {children}
    </>
  );
}
