import { disciplines, intakes, priorities } from "@/data/journey/config";
import { coursesByDiscipline } from "@/data/journey/courses";
import { destinationById, destinations, type Destination } from "@/data/journey/destinations";
import type { UserProfile } from "./types";

export type Direction = {
  destination: Destination;
  /** 1–5, how well the destination answers the student's stated priorities. */
  fit: number;
  fitLabel: string;
  courses: string[];
  /** True for the place the student named themselves. */
  chosen: boolean;
};

const label = (fit: number) => (fit >= 4.5 ? "Strong fit" : fit >= 3.5 ? "Good fit" : "Worth a look");

/**
 * Three directions for the exploring result. Destinations are ranked by the
 * average editorial weight across the student's priorities ("best overall
 * fit" when none were picked). A destination the student named always leads.
 *
 * Deliberately simple and explainable: it orders options, it does not predict
 * admission. Swap it for a real recommendation service behind the same shape.
 */
export function recommendDirections(p: UserProfile, count = 3): Direction[] {
  const keys = p.priorities.length ? p.priorities : (["fit"] as const);
  const chosen = new Set(p.destinations);
  const courses = coursesByDiscipline[p.discipline ?? "undecided"].slice(0, 3);

  return destinations
    .map((d) => {
      const avg = keys.reduce((sum, k) => sum + d.weights[k], 0) / keys.length;
      const fit = Math.min(5, Math.round(avg * 2) / 2);
      return { destination: d, fit, fitLabel: label(fit), courses, chosen: chosen.has(d.id) };
    })
    .sort((a, b) => Number(b.chosen) - Number(a.chosen) || b.fit - a.fit)
    .slice(0, count);
}

/** Human labels for each answer, shared by the answer pins and the counsellor enquiry. */
export function answerLabels(p: UserProfile) {
  return {
    interest: disciplines.find((d) => d.id === p.discipline)?.label ?? null,
    priorities: p.priorities.map((id) => priorities.find((x) => x.id === id)?.label ?? id),
    destination: p.destinations[0] ? destinationById[p.destinations[0]].label : p.openDestination ? "compare" : null,
    intake: intakes.find((i) => i.id === p.intake)?.label ?? null,
  };
}

/**
 * The personalised reveal as parts of one line:
 * Business + UK + Sep 2027 + Career + Scholarships. A destination we picked
 * for the student (via "Help me decide") is flagged so the UI can say so.
 */
export function revealFormula(p: UserProfile): { text: string; suggested?: boolean }[] {
  const parts: { text: string; suggested?: boolean }[] = [];
  const d = disciplines.find((x) => x.id === p.discipline);
  if (d) parts.push({ text: d.short });
  const place = p.destinations[0] ?? (p.openDestination ? recommendDirections(p)[0].destination.id : null);
  if (place) parts.push({ text: destinationById[place].label, suggested: !p.destinations[0] });
  const intake = intakes.find((o) => o.id === p.intake);
  if (intake) parts.push({ text: intake.short });
  for (const id of p.priorities) parts.push({ text: priorities.find((x) => x.id === id)?.short ?? id });
  return parts;
}

/** One line for the lead form's `context`, so the counsellor knows what was explored. */
export function explorationSummary(p: UserProfile) {
  return `Exploring: ${revealFormula(p).map((x) => x.text + (x.suggested ? " (suggested)" : "")).join(" + ")}`.slice(0, 200);
}

const MONTH_NAMES: Record<string, string> = { Jan: "January", Sep: "September", May: "May", Feb: "February", Jul: "July", Oct: "October", Apr: "April" };
const PLACE: Record<string, string> = { UK: "the UK", USA: "the USA" };

/**
 * The personalised result in one sentence: "You're exploring Business in the
 * UK for September 2027, with career opportunities and scholarships as your
 * priorities." Built only from the student's answers.
 */
export function explorationSentence(p: UserProfile) {
  const d = disciplines.find((x) => x.id === p.discipline);
  const subject = !d || d.id === "undecided" ? "your options" : d.short;
  const dest = p.destinations[0] ? destinationById[p.destinations[0]].label : null;
  const place = dest ? ` in ${PLACE[dest] ?? dest}` : p.openDestination ? ", with us helping you pick a country," : "";
  const it = intakes.find((o) => o.id === p.intake);
  const when = !it || it.id === "undecided" ? ", timing still open" : ` for ${it.label.replace(/^(\w{3})/, (m) => MONTH_NAMES[m] ?? m)}`;
  const pr = p.priorities.map((id) => priorities.find((x) => x.id === id)!.label.toLowerCase());
  const why = pr.length ? `, with ${pr.length > 1 ? `${pr.slice(0, -1).join(", ")} and ${pr[pr.length - 1]}` : pr[0]} as ${pr.length > 1 ? "your priorities" : "your priority"}` : "";
  return `You’re exploring ${subject}${place}${when}${why}.`.replace(",,", ",");
}
