import type { Metadata } from "next";
import { Quiz } from "@/components/sections/Quiz";
import { PageNav } from "@/components/ui/PageNav";

export const metadata: Metadata = {
  title: "Universities",
  description: "Answer five questions about your profile and budget to see an illustrative first shortlist of universities and courses.",
};

export default function Page() {
  return (
    <>
      <Quiz />
      <PageNav current="/universities" />
    </>
  );
}
