import { countries, type Country } from "@/data/countries";
import type { DestinationId, PriorityId } from "@/lib/journey/types";

/**
 * Journey destinations. Durations, intakes, tuition and scholarship notes are
 * read from `src/data/countries.ts` so the two never disagree; Europe has no
 * single country entry and carries its own copy.
 *
 * Illustrative demo data. Verify every figure against official sources
 * before launch — fees, scholarships and post-study work rules change.
 */

export type Destination = {
  id: DestinationId;
  label: string;
  /** Country used for the drawn landmark art. */
  art: Country;
  duration: string;
  tuition: string;
  scholarships: string;
  work: string;
  /** Short lifestyle notes pinned inside the head when this place is previewed. Mood, not fact. */
  vibes: string[];
  /**
   * Editorial weights, 1–5, of how strongly a destination tends to answer each
   * priority. They only rank directions against one another for the indicative
   * fit shown in the result; they are not published scores.
   */
  weights: Record<PriorityId, number>;
};

const byId = (id: string) => {
  const c = countries.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown country "${id}" in journey destinations`);
  return c;
};

const from = (id: string) => {
  const c = byId(id);
  return { art: c, duration: c.duration, tuition: c.tuition, scholarships: c.scholarships };
};

export const destinations: Destination[] = [
  {
    id: "uk", vibes: ["Historic campuses", "1-year master’s", "Rainy-day libraries"], label: "UK", ...from("uk"),
    work: "Post-study work route for eligible graduates",
    weights: { reputation: 5, career: 4, affordable: 3, scholarships: 4, postStudyWork: 3, studentLife: 4, fit: 4 },
  },
  {
    id: "usa", vibes: ["Big campus life", "Flexible majors", "Game days"], label: "USA", ...from("us"),
    work: "Practical training after study, longer for STEM",
    weights: { reputation: 5, career: 5, affordable: 1, scholarships: 4, postStudyWork: 3, studentLife: 5, fit: 4 },
  },
  {
    id: "canada", vibes: ["Co-op terms", "Multicultural cities", "Snowy winters"], label: "Canada", ...from("ca"),
    work: "Co-op terms and a post-graduation work permit",
    weights: { reputation: 4, career: 4, affordable: 3, scholarships: 3, postStudyWork: 5, studentLife: 4, fit: 4 },
  },
  {
    id: "australia", vibes: ["Beach weekends", "Outdoor campus life", "Research strength"], label: "Australia", ...from("au"),
    work: "Temporary graduate visa for eligible courses",
    weights: { reputation: 4, career: 4, affordable: 2, scholarships: 3, postStudyWork: 4, studentLife: 5, fit: 4 },
  },
  {
    id: "europe", vibes: ["Weekend trains", "Many languages", "Low-tuition options"], label: "Europe", art: byId("de"),
    duration: "1–2-year master’s, 3-year bachelor’s",
    tuition: "Low or no tuition at many public universities; varies by country",
    scholarships: "National and university schemes, often competitive",
    work: "Job-seeker periods after study in several countries",
    weights: { reputation: 4, career: 3, affordable: 5, scholarships: 3, postStudyWork: 4, studentLife: 4, fit: 4 },
  },
];

export const destinationById = Object.fromEntries(destinations.map((d) => [d.id, d])) as Record<DestinationId, Destination>;
