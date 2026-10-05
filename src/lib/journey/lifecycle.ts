import { appStatuses, disciplines, intakes, priorities } from "@/data/journey/config";
import { destinationById } from "@/data/journey/destinations";
import { daysUntil } from "./applying";
import type { LifecycleStage, Stage, UserProfile } from "./types";

/**
 * Where the student is on the whole road. Four stages are chosen directly on
 * the home film; the rest follow from what the student has recorded, never
 * from a timer: every application submitted means waiting, a confirmed offer
 * means departure, and a departure date in the past means arrival.
 */
export function lifecycleOf(p: UserProfile, today?: string): LifecycleStage {
  if (!p.journeyStage) return "anonymous";
  if (p.journeyStage === "offer") {
    if (!p.departureConfirmed) return "offer";
    if (today && p.departure.departureDate && daysUntil(p.departure.departureDate, today) < 0) return "arrival";
    return "departure";
  }
  if (p.journeyStage === "applying" && p.applications.length && p.applications.every((a) => appStatuses.find((s) => s.id === a.status)?.done)) {
    return "waiting";
  }
  return p.journeyStage;
}

/** The stage page a lifecycle stage lives on. */
export const stagePageFor = (l: Exclude<LifecycleStage, "anonymous">): Stage =>
  l === "waiting" ? "applying" : l === "departure" || l === "arrival" ? "offer" : l;

export type ContextChip = { id: string; text: string; href: string };

/** The compact "Business · UK · Sep 2027" context, each chip a way to edit it. */
export function contextChips(p: UserProfile): ContextChip[] {
  const chips: ContextChip[] = [];
  const d = disciplines.find((x) => x.id === p.discipline);
  if (d) chips.push({ id: "course", text: p.course ?? d.short, href: "/journey/exploring?step=course" });
  if (p.destinations.length) chips.push({ id: "where", text: p.destinations.map((x) => destinationById[x].label).join(", "), href: "/journey/exploring?step=destination" });
  else if (p.openDestination) chips.push({ id: "where", text: "Open to suggestions", href: "/journey/exploring?step=destination" });
  const it = intakes.find((o) => o.id === p.intake);
  if (it) chips.push({ id: "when", text: it.short, href: "/journey/exploring?step=intake" });
  if (p.priorities.length) chips.push({ id: "why", text: p.priorities.map((id) => priorities.find((o) => o.id === id)!.short).join(" + "), href: "/journey/exploring?step=priorities" });
  return chips;
}

/** True once the four exploring answers exist. */
export const exploringDone = (p: UserProfile) => !!p.discipline && (p.destinations.length > 0 || p.openDestination) && !!p.intake && p.priorities.length > 0;

/**
 * The first step a stage still needs, so a student is never asked again for
 * something they've already told us. Falls back to the stage's summary step.
 */
export function firstOpenStep(stage: Stage, p: UserProfile): string {
  switch (stage) {
    case "exploring":
      if (!p.discipline) return "course";
      if (!p.destinations.length && !p.openDestination) return "destination";
      if (!p.intake) return "intake";
      if (!p.priorities.length) return "priorities";
      return "result";
    case "shortlisting":
      if (p.shortlist.length) return "reveal";
      if (!p.discipline) return "course";
      if (!p.destinations.length && !p.openDestination) return "countries";
      if (!p.intake) return "intake";
      if (!p.qualification || !p.academicScore) return "fit";
      if (!p.uniPriorities.length) return "priorities";
      return "existing";
    case "applying":
      if (!p.applications.length) return "universities";
      return "dashboard";
    case "offer":
      if (p.departureConfirmed) return "move";
      if (!p.offerSituation) return "situation";
      if (!p.offers.length) return "offers";
      return "acceptance";
  }
}
