import type { LifecycleStage } from "@/lib/journey/types";

/**
 * Copy for the personalised home: what a returning student sees instead of
 * the opening film, plus the journey bar and the plan-saving prompt.
 */

export const journeyBar = {
  label: "Your study-abroad journey",
  stops: [
    { id: "exploring", label: "Exploring", href: "/journey/exploring" },
    { id: "shortlisting", label: "Shortlisting", href: "/journey/shortlisting" },
    { id: "applying", label: "Applying", href: "/journey/applying" },
    { id: "offer", label: "Offer", href: "/journey/offer" },
    { id: "departure", label: "Departure", href: "/journey/offer?step=move" },
  ] as const,
  edit: "Edit",
};

/** Which bar stop each lifecycle stage lights up. */
export const barStopFor: Record<Exclude<LifecycleStage, "anonymous">, (typeof journeyBar.stops)[number]["id"]> = {
  exploring: "exploring", shortlisting: "shortlisting", applying: "applying", waiting: "applying",
  offer: "offer", departure: "departure", arrival: "departure",
};

export type HomeModule = { id: string; title: string; text: string; href: string; icon: string };

export const homeCopy = {
  update: "Update where I am in my journey",
  back: "Back to my journey",
  nextEyebrow: "Next best action",
  modulesLabel: "For where you are now",
  usefulTitle: "Useful for your journey",
  headings: {
    exploring: "Planning your study abroad?",
    shortlisting: "Choosing where to apply",
    applying: "Your applications",
    waiting: "Waiting for decisions",
    offer: "Your offer, your next move",
    departure: "Getting ready to go",
    arrival: "You made it",
  } satisfies Record<Exclude<LifecycleStage, "anonymous">, string>,
  empty: {
    shortlist: { text: "Your shortlist is empty.", cta: "Explore universities", href: "/journey/exploring?step=result" },
    applications: { text: "No applications yet.", cta: "Start from your shortlist", href: "/journey/shortlisting?step=finalise" },
    offers: { text: "No offers recorded yet.", cta: "View my application status", href: "/journey/applying?step=dashboard" },
  },
  modules: {
    exploring: [
      { id: "start", title: "My starting point", text: "Your answers so far, and what to change.", href: "/journey/exploring?step=result", icon: "sparkles" },
      { id: "where", title: "Where could I study?", text: "Compare five destinations side by side.", href: "/countries", icon: "globe" },
      { id: "what", title: "What could I study?", text: "Course areas and where they lead.", href: "/journey/exploring?step=course", icon: "graduation" },
      { id: "cost", title: "What could it cost?", text: "Tuition and living cost ranges by country.", href: "/countries", icon: "wallet" },
      { id: "unis", title: "Universities worth exploring", text: "Matched to your answers. Save the ones you like.", href: "/journey/exploring?step=result#saved", icon: "star" },
      { id: "sch", title: "Scholarships", text: "Example awards by country, level and subject.", href: "/scholarships", icon: "award" },
    ],
    shortlisting: [
      { id: "list", title: "My shortlist", text: "Order it, star the ones you’ll pursue.", href: "/journey/shortlisting?step=finalise", icon: "star" },
      { id: "compare", title: "Compare", text: "Two to four universities side by side.", href: "/journey/shortlisting?step=compare", icon: "chart" },
      { id: "eligibility", title: "Eligibility", text: "Your academic fit, in four quick taps.", href: "/journey/shortlisting?step=fit", icon: "graduation" },
      { id: "sch", title: "Scholarships", text: "Awards worth checking for your list.", href: "/scholarships", icon: "award" },
      { id: "deadlines", title: "Deadlines", text: "Typical application windows for each.", href: "/journey/shortlisting?step=reveal", icon: "pin" },
    ],
    applying: [
      { id: "apps", title: "My applications", text: "Every application and where it stands.", href: "/journey/applying?step=dashboard", icon: "graduation" },
      { id: "docs", title: "Documents", text: "What’s still pending, per university.", href: "/journey/applying?step=pending", icon: "star" },
      { id: "deadlines", title: "Deadlines", text: "Every date on one line, soonest first.", href: "/journey/applying?step=deadlines", icon: "pin" },
      { id: "decisions", title: "Decisions", text: "Update statuses as replies arrive.", href: "/journey/applying?step=status", icon: "award" },
    ],
    waiting: [
      { id: "status", title: "Decisions", text: "Awaiting, interviews, requests, offers.", href: "/journey/applying?step=status", icon: "award" },
      { id: "interview", title: "Interview preparation", text: "What to do before an interview or assessment.", href: "/journey/applying?step=next", icon: "music" },
      { id: "sch", title: "Scholarships", text: "Deadlines often fall while you wait.", href: "/scholarships", icon: "award" },
      { id: "funding", title: "Funding preparation", text: "Get your numbers ready before an offer lands.", href: "/journey/offer?step=funding", icon: "wallet" },
      { id: "after", title: "What happens after an offer", text: "Deposit, visa, accommodation, flights.", href: "/how-it-works", icon: "plane" },
    ],
    offer: [
      { id: "offers", title: "My offers", text: "Compare them and choose — the choice is yours.", href: "/journey/offer?step=acceptance", icon: "star" },
      { id: "conditions", title: "Conditions", text: "What’s left before the offer is firm.", href: "/journey/offer?step=conditions", icon: "pin" },
      { id: "money", title: "Money", text: "Tuition, scholarship, living costs and the gap.", href: "/journey/offer?step=funding", icon: "wallet" },
    ],
    departure: [
      { id: "visa", title: "Visa", text: "Your destination’s checklist, step by step.", href: "/journey/offer?step=visa", icon: "graduation" },
      { id: "money", title: "Money", text: "What’s covered and what’s still to find.", href: "/journey/offer?step=funding", icon: "wallet" },
      { id: "home", title: "Accommodation", text: "Preferences, budget, booking.", href: "/journey/offer?step=accommodation", icon: "pin" },
      { id: "travel", title: "Travel", text: "Flights, insurance, SIM, forex, packing.", href: "/journey/offer?step=travel", icon: "plane" },
    ],
    arrival: [
      { id: "travel", title: "Arrival checklist", text: "Banking, SIM and registration in your first weeks.", href: "/journey/offer?step=travel", icon: "pin" },
      { id: "stories", title: "Student stories", text: "How others settled in.", href: "/stories", icon: "star" },
    ],
  } satisfies Record<Exclude<LifecycleStage, "anonymous">, HomeModule[]>,
};

/**
 * "Useful for your journey": site content tagged by stage, so each student
 * sees what fits where they are. Add tags here as content grows.
 */
export const usefulContent: { title: string; href: string; stages: LifecycleStage[] }[] = [
  { title: "How our counselling works", href: "/how-it-works", stages: ["exploring", "shortlisting", "applying"] },
  { title: "Compare destinations", href: "/countries", stages: ["exploring", "shortlisting"] },
  { title: "Example scholarships", href: "/scholarships", stages: ["exploring", "shortlisting", "applying", "waiting"] },
  { title: "Find your university match", href: "/universities", stages: ["exploring", "shortlisting"] },
  { title: "Students who made the move", href: "/stories", stages: ["offer", "departure", "arrival", "waiting"] },
  { title: "Meet the counsellors", href: "/about", stages: ["applying", "waiting", "offer", "departure"] },
];

export const leadPrompt = {
  title: "Save your Global Scholar plan",
  text: "Leave your details and a counsellor can pick up exactly where you are. No obligation.",
  dismiss: "Not now",
};

export const discoverCopy = {
  title: "Universities worth exploring",
  hint: "Matched to your answers. Save the ones you like.",
  groups: { strong: "Strong match", worth: "Worth exploring", value: "Value options" },
  save: "Save", saved: "Saved",
  prompt: "You’ve found a few universities you like. Ready to build your shortlist?",
  promptCta: "Build my shortlist",
};
