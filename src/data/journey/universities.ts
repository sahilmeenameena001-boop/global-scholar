import type { DestinationId, DisciplineId } from "@/lib/journey/types";

/**
 * The shortlisting catalogue.
 *
 * Fictional universities for the demo build — the names are invented and
 * every figure (ranking band, tuition, selectivity, ratings) is illustrative.
 * Replace this file with a real course/university source before launch, and
 * never present these values as verified.
 */

export type Intake = "jan" | "sep";

export type University = {
  id: string;
  name: string;
  city: string;
  country: DestinationId;
  /** Shown in comparisons. Illustrative band, not a published ranking. */
  rankBand: string;
  /** 1 (open) – 5 (highly selective). Drives ambitious / target / safe. */
  selectivity: 1 | 2 | 3 | 4 | 5;
  tuition: string;
  /** 1 (low) – 5 (high), for "lower tuition" ranking. */
  tuitionLevel: 1 | 2 | 3 | 4 | 5;
  scholarship: "strong" | "some" | "limited";
  /** Editorial 1–5 ratings used only to order universities against one another. */
  ratings: { reputation: number; employability: number; courseQuality: number; location: number; studentLife: number };
  disciplines: DisciplineId[];
  intakes: Intake[];
  careerOutcome: string;
};

const ALL: DisciplineId[] = ["business", "technology", "engineering", "law", "medicine", "design"];

export const universities: University[] = [
  // United Kingdom
  { id: "northbridge", name: "Northbridge University", city: "Manchester", country: "uk", rankBand: "Top 150", selectivity: 4, tuition: "£18,000 – £24,000", tuitionLevel: 3, scholarship: "strong",
    ratings: { reputation: 4, employability: 4, courseQuality: 4, location: 4, studentLife: 5 }, disciplines: ALL, intakes: ["sep", "jan"], careerOutcome: "Strong graduate employer links in finance and tech" },
  { id: "kingsmere", name: "Kingsmere University", city: "Edinburgh", country: "uk", rankBand: "Top 50", selectivity: 5, tuition: "£24,000 – £32,000", tuitionLevel: 4, scholarship: "some",
    ratings: { reputation: 5, employability: 5, courseQuality: 5, location: 4, studentLife: 4 }, disciplines: ["business", "law", "medicine", "technology", "design"], intakes: ["sep"], careerOutcome: "Research-led; graduates sought by global firms" },
  { id: "harbourside", name: "Harbourside University", city: "Bristol", country: "uk", rankBand: "Top 300", selectivity: 2, tuition: "£15,000 – £19,000", tuitionLevel: 2, scholarship: "strong",
    ratings: { reputation: 3, employability: 4, courseQuality: 3, location: 4, studentLife: 4 }, disciplines: ["business", "technology", "engineering", "design"], intakes: ["sep", "jan"], careerOutcome: "Placement years built into many degrees" },

  // United States
  { id: "eastbrook", name: "Eastbrook University", city: "Boston", country: "usa", rankBand: "Top 50", selectivity: 5, tuition: "USD 52,000 – 60,000", tuitionLevel: 5, scholarship: "some",
    ratings: { reputation: 5, employability: 5, courseQuality: 5, location: 5, studentLife: 4 }, disciplines: ["business", "technology", "engineering", "medicine"], intakes: ["sep"], careerOutcome: "Deep alumni network across consulting and tech" },
  { id: "redwood", name: "Redwood State University", city: "Sacramento", country: "usa", rankBand: "Top 250", selectivity: 3, tuition: "USD 28,000 – 34,000", tuitionLevel: 3, scholarship: "strong",
    ratings: { reputation: 3, employability: 4, courseQuality: 4, location: 4, studentLife: 5 }, disciplines: ALL, intakes: ["sep", "jan"], careerOutcome: "Co-op style internships with West Coast employers" },
  { id: "prairie", name: "Prairie Valley University", city: "Chicago", country: "usa", rankBand: "Top 400", selectivity: 2, tuition: "USD 24,000 – 29,000", tuitionLevel: 2, scholarship: "strong",
    ratings: { reputation: 3, employability: 3, courseQuality: 3, location: 4, studentLife: 4 }, disciplines: ["business", "technology", "engineering", "law"], intakes: ["sep", "jan"], careerOutcome: "Practical, industry-taught programmes" },

  // Canada
  { id: "lakeshore", name: "Lakeshore Institute of Technology", city: "Toronto", country: "canada", rankBand: "Top 200", selectivity: 4, tuition: "CAD 30,000 – 38,000", tuitionLevel: 3, scholarship: "some",
    ratings: { reputation: 4, employability: 5, courseQuality: 4, location: 5, studentLife: 4 }, disciplines: ["technology", "engineering", "business"], intakes: ["sep", "jan"], careerOutcome: "Paid co-op terms with Toronto tech employers" },
  { id: "cedarline", name: "Cedarline University", city: "Vancouver", country: "canada", rankBand: "Top 300", selectivity: 3, tuition: "CAD 24,000 – 30,000", tuitionLevel: 3, scholarship: "strong",
    ratings: { reputation: 3, employability: 4, courseQuality: 4, location: 5, studentLife: 5 }, disciplines: ALL, intakes: ["sep", "jan"], careerOutcome: "Strong pathways into post-graduation work" },
  { id: "riverbend", name: "Riverbend University", city: "Montréal", country: "canada", rankBand: "Top 500", selectivity: 2, tuition: "CAD 18,000 – 24,000", tuitionLevel: 2, scholarship: "some",
    ratings: { reputation: 3, employability: 3, courseQuality: 3, location: 4, studentLife: 5 }, disciplines: ["business", "design", "law", "medicine"], intakes: ["sep", "jan"], careerOutcome: "Bilingual city with a growing creative sector" },

  // Australia
  { id: "coastal", name: "Coastal Pacific University", city: "Sydney", country: "australia", rankBand: "Top 150", selectivity: 4, tuition: "AUD 38,000 – 46,000", tuitionLevel: 4, scholarship: "some",
    ratings: { reputation: 4, employability: 4, courseQuality: 4, location: 5, studentLife: 5 }, disciplines: ALL, intakes: ["jan", "sep"], careerOutcome: "Industry projects in health, IT and business" },
  { id: "wattle", name: "Wattle Grove University", city: "Melbourne", country: "australia", rankBand: "Top 300", selectivity: 3, tuition: "AUD 30,000 – 36,000", tuitionLevel: 3, scholarship: "strong",
    ratings: { reputation: 3, employability: 4, courseQuality: 4, location: 4, studentLife: 5 }, disciplines: ["business", "technology", "design", "medicine"], intakes: ["jan", "sep"], careerOutcome: "Work-integrated learning across most courses" },
  { id: "swanridge", name: "Swanridge University", city: "Perth", country: "australia", rankBand: "Top 500", selectivity: 2, tuition: "AUD 26,000 – 31,000", tuitionLevel: 2, scholarship: "strong",
    ratings: { reputation: 3, employability: 3, courseQuality: 3, location: 4, studentLife: 4 }, disciplines: ["engineering", "technology", "business"], intakes: ["jan", "sep"], careerOutcome: "Links to the energy and mining sectors" },

  // Europe
  { id: "rheinland", name: "Rheinland Technical University", city: "Aachen", country: "europe", rankBand: "Top 150", selectivity: 4, tuition: "€0 – €3,000 per year (public)", tuitionLevel: 1, scholarship: "some",
    ratings: { reputation: 4, employability: 5, courseQuality: 5, location: 3, studentLife: 3 }, disciplines: ["engineering", "technology"], intakes: ["sep", "jan"], careerOutcome: "Close ties to automotive and engineering industry" },
  { id: "amstelhaven", name: "Amstelhaven University", city: "Amsterdam", country: "europe", rankBand: "Top 200", selectivity: 3, tuition: "€12,000 – €18,000", tuitionLevel: 2, scholarship: "some",
    ratings: { reputation: 4, employability: 4, courseQuality: 4, location: 5, studentLife: 5 }, disciplines: ["business", "law", "design", "technology"], intakes: ["sep"], careerOutcome: "International city with English-speaking employers" },
  { id: "seinevalley", name: "Seine Valley School of Management", city: "Paris", country: "europe", rankBand: "Top 300", selectivity: 3, tuition: "€14,000 – €22,000", tuitionLevel: 3, scholarship: "limited",
    ratings: { reputation: 4, employability: 4, courseQuality: 4, location: 5, studentLife: 4 }, disciplines: ["business", "design"], intakes: ["sep", "jan"], careerOutcome: "Business school with a strong luxury and retail network" },
];

export const universityById = Object.fromEntries(universities.map((u) => [u.id, u])) as Record<string, University>;
