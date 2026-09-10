import type { Metadata } from "next";
import { Stories } from "@/components/sections/Stories";
import { PageNav } from "@/components/ui/PageNav";

export const metadata: Metadata = {
  title: "Student Stories",
  description: "Illustrative journeys from first counselling conversation to arrival on campus.",
};

export default function Page() {
  return (
    <>
      <Stories />
      <PageNav current="/stories" />
    </>
  );
}
