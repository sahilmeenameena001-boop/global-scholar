import type { Metadata } from "next";
import { Destinations } from "@/components/sections/Destinations";
import { PageNav } from "@/components/ui/PageNav";

export const metadata: Metadata = {
  title: "Countries",
  description: "Compare five study destinations on typical duration, intake months, tuition and scholarship availability.",
};

export default function Page() {
  return (
    <>
      <Destinations />
      <PageNav current="/countries" />
    </>
  );
}
