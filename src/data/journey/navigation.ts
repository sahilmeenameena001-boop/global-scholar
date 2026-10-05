import type { LifecycleStage } from "@/lib/journey/types";

/**
 * Navigation by lifecycle stage. One navbar renders whichever list applies;
 * before a student picks a state it shows the site's own pages (`nav.ts`).
 * Journey links point at the stage pages and their steps, so every item
 * lands somewhere real.
 */

export type JourneyNavLink = { label: string; href: string };

const exploring: JourneyNavLink[] = [
  { label: "My Journey", href: "/" },
  { label: "Discover", href: "/journey/exploring?step=result" },
  { label: "Saved", href: "/journey/exploring?step=result#saved" },
  { label: "Compare", href: "/journey/shortlisting?step=compare" },
  { label: "Scholarships", href: "/scholarships" },
];

const shortlisting: JourneyNavLink[] = [
  { label: "My Journey", href: "/" },
  { label: "My Shortlist", href: "/journey/shortlisting?step=finalise" },
  { label: "Compare", href: "/journey/shortlisting?step=compare" },
  { label: "Eligibility", href: "/journey/shortlisting?step=fit" },
  { label: "Deadlines", href: "/journey/shortlisting?step=reveal" },
];

const applying: JourneyNavLink[] = [
  { label: "My Applications", href: "/journey/applying?step=dashboard" },
  { label: "Documents", href: "/journey/applying?step=pending" },
  { label: "Deadlines", href: "/journey/applying?step=deadlines" },
  { label: "Decisions", href: "/journey/applying?step=status" },
];

const move: JourneyNavLink[] = [
  { label: "My Move", href: "/journey/offer?step=move" },
  { label: "Visa", href: "/journey/offer?step=visa" },
  { label: "Money", href: "/journey/offer?step=funding" },
  { label: "Accommodation", href: "/journey/offer?step=accommodation" },
  { label: "Travel", href: "/journey/offer?step=travel" },
];

export const navByLifecycle: Record<Exclude<LifecycleStage, "anonymous">, JourneyNavLink[]> = {
  exploring,
  shortlisting,
  applying,
  waiting: applying,
  offer: move,
  departure: move,
  arrival: move,
};
