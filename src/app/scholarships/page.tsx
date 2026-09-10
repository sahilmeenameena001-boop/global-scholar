import type { Metadata } from "next";
import { Scholarships } from "@/components/sections/Scholarships";
import { PageNav } from "@/components/ui/PageNav";

export const metadata: Metadata = {
  title: "Scholarships",
  description: "Filter example scholarships by country, study level and subject, then ask a counsellor whether you would qualify.",
};

export default function Page() {
  return (
    <>
      <Scholarships />
      <PageNav current="/scholarships" />
    </>
  );
}
