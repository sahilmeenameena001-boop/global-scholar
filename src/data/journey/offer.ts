import type { DestinationId, OfferSituation } from "@/lib/journey/types";
import type { Option } from "./config";

/**
 * Offer & departure content. Visa steps are per country and render from this
 * configuration — never one country's workflow applied to everyone.
 *
 * General guidance only. Immigration and enrolment rules are set by each
 * government and university and change; every visa screen links the student
 * to check the official source, and nothing here is presented as legal advice.
 */

export const offerSituations: Option<OfferSituation>[] = [
  { id: "one", label: "I have one offer", short: "One offer", icon: "graduation" },
  { id: "multiple", label: "I have multiple offers", short: "Multiple offers", icon: "star" },
  { id: "conditional", label: "My offer is conditional", short: "Conditional offer", icon: "pin" },
  { id: "waiting", label: "I’m waiting on another decision", short: "Waiting on another", icon: "sparkles" },
];

/** Conditions a conditional offer commonly carries; the student ticks theirs. */
export const commonConditions = [
  { id: "grades", label: "Final grades / degree result" },
  { id: "english", label: "English test score" },
  { id: "documents", label: "Original transcripts or certificates" },
  { id: "references", label: "References" },
  { id: "funds", label: "Proof of funds" },
];

export type VisaItem = { id: string; title: string; description: string; required: boolean; order: number };

export const visaRequirements: Record<DestinationId, VisaItem[]> = {
  uk: [
    { id: "cas", title: "Receive your CAS", description: "Your university issues it once you accept and meet the conditions.", required: true, order: 1 },
    { id: "funds", title: "Financial evidence", description: "Show you can cover tuition and living costs for the required period.", required: true, order: 2 },
    { id: "tb", title: "TB test, if required", description: "Only for some countries of residence. Check whether it applies to you.", required: false, order: 3 },
    { id: "form", title: "Online visa application", description: "Complete the form and pay the fee and any health surcharge.", required: true, order: 4 },
    { id: "biometrics", title: "Biometrics appointment", description: "Book and attend to give fingerprints and a photo.", required: true, order: 5 },
  ],
  usa: [
    { id: "i20", title: "Receive your I-20", description: "Issued by your university after you accept and show funding.", required: true, order: 1 },
    { id: "sevis", title: "Pay the SEVIS fee", description: "Pay it before your visa interview and keep the receipt.", required: true, order: 2 },
    { id: "ds160", title: "DS-160 visa form", description: "Complete the online form and print the confirmation.", required: true, order: 3 },
    { id: "funds", title: "Financial documents", description: "Bank statements or sponsor letters matching your I-20.", required: true, order: 4 },
    { id: "interview", title: "Visa interview", description: "Book, prepare, and attend your consulate interview.", required: true, order: 5 },
  ],
  canada: [
    { id: "loa", title: "Letter of acceptance", description: "From your university; you’ll need it for the application.", required: true, order: 1 },
    { id: "funds", title: "Proof of funds", description: "Show you can cover tuition, living costs and travel.", required: true, order: 2 },
    { id: "form", title: "Study permit application", description: "Apply online with your documents and fee.", required: true, order: 3 },
    { id: "biometrics", title: "Biometrics", description: "Give fingerprints and a photo at an application centre.", required: true, order: 4 },
    { id: "medical", title: "Medical exam, if required", description: "Only for some applicants. Check whether it applies to you.", required: false, order: 5 },
  ],
  australia: [
    { id: "coe", title: "Receive your CoE", description: "Your confirmation of enrolment, issued after you accept and pay.", required: true, order: 1 },
    { id: "oshc", title: "Overseas student health cover", description: "Arrange cover for the length of your visa.", required: true, order: 2 },
    { id: "statement", title: "Genuine student statement", description: "Explain why you’re choosing this course and country.", required: true, order: 3 },
    { id: "funds", title: "Financial capacity", description: "Evidence you can support yourself during study.", required: true, order: 4 },
    { id: "form", title: "Student visa application", description: "Apply online and attend biometrics if asked.", required: true, order: 5 },
  ],
  europe: [
    { id: "enrolment", title: "Confirmation of enrolment", description: "Your university’s admission or enrolment letter.", required: true, order: 1 },
    { id: "funds", title: "Proof of funds", description: "Often a blocked account or bank statements; amounts vary by country.", required: true, order: 2 },
    { id: "insurance", title: "Health insurance", description: "Cover that meets your destination country’s rules.", required: true, order: 3 },
    { id: "appointment", title: "National visa appointment", description: "Book early; slots can fill months ahead.", required: true, order: 4 },
    { id: "residence", title: "Residence registration on arrival", description: "Register your address in the first weeks.", required: false, order: 5 },
  ],
};

/** Currency symbol prefix for amounts the student enters. */
export const currency: Record<DestinationId, string> = { uk: "£", usa: "USD ", canada: "CAD ", australia: "AUD ", europe: "€" };

/** Indicative annual living cost per destination, in its own currency. A starting point the student can overwrite. */
export const livingCostEstimate: Record<DestinationId, number> = { uk: 12000, usa: 18000, canada: 20000, australia: 25000, europe: 11000 };

export const accommodationOptions: Option[] = [
  { id: "halls", label: "University halls", short: "Halls", icon: "graduation" },
  { id: "private", label: "Private student accommodation", short: "Private student housing", icon: "star" },
  { id: "shared", label: "Shared flat", short: "Shared flat", icon: "pin" },
  { id: "homestay", label: "Homestay", short: "Homestay", icon: "music" },
  { id: "unsure", label: "Not sure", short: "Not sure", icon: "sparkles" },
];
export const commuteOptions: Option[] = [
  { id: "short", label: "Under 20 min", short: "<20 min" },
  { id: "medium", label: "20–40 min", short: "20–40 min" },
  { id: "long", label: "Over 40 min is fine", short: "40+ min" },
];
export const sharingOptions: Option[] = [
  { id: "private", label: "Private room", short: "Private" },
  { id: "shared", label: "Happy to share", short: "Shared" },
];
export const accommodationStatuses: Option[] = [
  { id: "notStarted", label: "Not started", short: "Not started" },
  { id: "searching", label: "Searching", short: "Searching" },
  { id: "booked", label: "Booked", short: "Booked" },
];

export const travelChecklist: Option[] = [
  { id: "flights", label: "Flights", short: "flights", icon: "plane" },
  { id: "insurance", label: "Insurance", short: "insurance", icon: "star" },
  { id: "transfer", label: "Airport transfer", short: "airport transfer", icon: "pin" },
  { id: "forex", label: "Forex", short: "forex", icon: "wallet" },
  { id: "sim", label: "International SIM", short: "international SIM", icon: "sparkles" },
  { id: "banking", label: "Banking", short: "bank account", icon: "wallet" },
  { id: "documents", label: "Travel documents", short: "travel documents", icon: "graduation" },
  { id: "packing", label: "Packing", short: "packing", icon: "music" },
];

export const offerCopy = {
  situation: { prompt: "Where are you with offers?", hint: "Pick the one that fits best." },
  offers: {
    prompt: "Which offers do you have?", hint: "Add each offer. The details are optional.",
    fromApplications: "From your applications", search: "Add a university", searchPlaceholder: "Search, or type any university name",
    addCustom: (n: string) => `Add “${n}”`, type: "Offer type", conditional: "Conditional", unconditional: "Unconditional",
    country: "Country", tuition: "Tuition (per year)", scholarship: "Scholarship", deposit: "Deposit amount", depositDeadline: "Deposit deadline",
    remove: "Remove offer", needOne: "Add at least one offer.",
  },
  acceptance: {
    prompt: "Which offer are you accepting?", promptOne: "Have you accepted your offer?",
    choose: "I’m choosing this university", chosen: "Your choice", accepted: "Yes, I’ve accepted it", notYet: "Not yet",
    compareHint: "Side by side, weighted to what matters to you. The choice is yours.",
    dims: { course: "Course fit", reputation: "Reputation", career: "Career outcomes", tuition: "Tuition", scholarship: "Scholarship", living: "Living costs", location: "Location", postStudy: "Post-study opportunities", priorities: "Your priorities" },
    deposit: "Deposit paid", confirm: "Start my departure plan", confirmHint: "This switches your journey to preparing for the move.",
  },
  conditions: { prompt: "What conditions are still open?", hint: "Tick each one once it’s met.", none: "No conditions — it’s unconditional.", add: "Add a condition", placeholder: "e.g. Final transcript" },
  visa: { prompt: "Your visa checklist", hint: "General steps for your destination.", source: "Rules change: check the official government source before you apply.", notStarted: "Not started", inProgress: "In progress", done: "Done", pickOffer: "Choose your offer first, so we know the country." },
  funding: {
    prompt: "How will you fund it?", hint: "Rough numbers are fine. Everything is per year.",
    fields: { tuition: "Tuition total", scholarship: "Scholarship", paid: "Already paid", livingCost: "Living costs (estimate)", family: "Family contribution", loan: "Education loan" },
    remaining: "Remaining tuition", need: "Total still to cover", gap: "Funding gap", covered: "Fully covered",
    ctas: { loan: "Explore education loan", forex: "Understand forex", plan: "Review payment plan" },
    estimate: "Indicative estimate; adjust to your city.",
  },
  accommodation: { prompt: "Where will you live?", hint: "Preferences first; book when you’re ready.", preference: "Preference", budget: "Monthly budget", commute: "Commute", sharing: "Room", status: "Status" },
  travel: { prompt: "Getting there", hint: "Tick things off as you go.", date: "Departure date", countdown: (n: number) => (n === 0 ? "Departure day!" : n === 1 ? "1 day until departure" : `${n} days until departure`) },
  move: {
    eyebrow: "My move", accepted: "Offer accepted", deposit: "Deposit", visa: "Visa", accommodation: "Accommodation", flights: "Flights",
    paid: "Paid", pending: "Pending", booked: "Booked", notBooked: "Not booked", primary: "Plan my next move", counsellor: "Talk to a counsellor",
    ready: (city: string) => `You’re ready for ${city}.`,
  },
  next: "Continue",
  back: "Back",
  modal: "Talk to a counsellor about your move",
  disclaimer: "Visa steps are general guidance, not legal advice. Amounts are what you entered; living costs are indicative.",
};
