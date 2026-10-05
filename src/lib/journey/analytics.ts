import type { Stage, UserProfile } from "./types";

/**
 * Vendor-neutral analytics. Components call `track()`; where the events go is
 * decided by the sinks registered here. Plug in Segment, PostHog, GA4 or a
 * first-party endpoint with `addAnalyticsSink` and nothing else changes.
 */

export type JourneyEvent =
  | "hero_view"
  | "journey_hover"
  | "journey_selected"
  | "journey_step_view"
  | "journey_answer"
  | "journey_completed"
  | "journey_started"
  | "journey_stage_selected"
  | "discipline_selected"
  | "destination_selected"
  | "intake_selected"
  | "priority_selected"
  | "exploration_completed"
  | "shortlist_generated"
  | "shortlist_compared"
  | "shortlist_finalised"
  | "university_saved"
  | "university_removed"
  | "application_started"
  | "document_completed"
  | "offer_added"
  | "offer_compared"
  | "visa_started"
  | "departure_plan_opened"
  | "stage_cta_clicked"
  | "university_view"
  | "comparison_started"
  | "shortlist_completed"
  | "application_submitted"
  | "offer_selected"
  | "visa_completed"
  | "departure_task_completed"
  | "lead_created"
  | "counsellor_cta_clicked";

export type EventProps = Record<string, string | number | boolean | string[] | null | undefined>;
export type AnalyticsSink = (event: JourneyEvent, props: EventProps) => void;

const sinks = new Set<AnalyticsSink>();

export function addAnalyticsSink(sink: AnalyticsSink) {
  sinks.add(sink);
  return () => { sinks.delete(sink); };
}

/** Tag managers read `window.dataLayer`; pushing to it couples to no single vendor. */
const dataLayerSink: AnalyticsSink = (event, props) => {
  const w = window as unknown as { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...props });
};
const devSink: AnalyticsSink = (event, props) => console.debug("[journey]", event, props);

let defaults = false;
function ensureDefaults() {
  if (defaults || typeof window === "undefined") return;
  defaults = true;
  sinks.add(dataLayerSink);
  if (process.env.NODE_ENV !== "production") sinks.add(devSink);
}

export function track(event: JourneyEvent, props: EventProps = {}) {
  ensureDefaults();
  const payload = { ...props, timestamp: Date.now() };
  for (const sink of sinks) {
    try { sink(event, payload); } catch { /* a failing sink must never break the journey */ }
  }
}

/** The metadata worth attaching to most events, derived from the profile. Never includes contact details. */
export function profileMeta(p: UserProfile, stage?: Stage | null): EventProps {
  return {
    journeyStage: stage ?? p.journeyStage,
    discipline: p.discipline,
    course: p.course,
    destination: p.destinations[0] ?? (p.openDestination ? "compare" : null),
    intake: p.intake,
    priorities: p.priorities,
  };
}
