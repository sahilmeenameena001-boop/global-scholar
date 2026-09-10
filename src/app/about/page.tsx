import type { Metadata } from "next";
import { About } from "@/components/sections/About";
import { Counsellors } from "@/components/sections/Counsellors";
import { PageNav } from "@/components/ui/PageNav";

export const metadata: Metadata = {
  title: "About",
  description: "An independent study-abroad counselling team: how we work, what we charge for, and what we will never promise.",
};

export default function Page() {
  return (
    <>
      <About />
      <Counsellors />
      <PageNav current="/about" />
    </>
  );
}
