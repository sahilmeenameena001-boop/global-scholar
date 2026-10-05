import {
  applyingExtras, applyingPiles, offerScene,
  shortlistChaos, shortlistColumns, shortlistFolder, shortlistNoise, shortlistUniversities,
} from "@/data/journey/assets";
import { stageById } from "@/data/journey/config";
import { applicationDocuments } from "@/data/journey/requirements";
import {
  type ArtSpec, type JourneyState, type MotionProfile,
  type SceneItem, type Stage, type UserProfile,
} from "./types";

/**
 * Scene composers: pure functions from journey state to the list of thoughts
 * inside the head. Components never decide what is on screen — they render
 * whatever these return, and `ThoughtCanvas` animates the difference. An item
 * that disappears from the list goes back into the head; a new id is born
 * from it; an id that changes position glides there.
 */

/**
 * The one entry point the journey shell calls. `phase` is the stage's own
 * animation clock (see `useStagePhase`): 0 is the overwhelm a student arrives
 * with, higher values are the order the stage brings to it.
 */
export function composeScene(
  stage: Stage | null, steps: JourneyState["steps"], profile: UserProfile, phase: number,
): { items: SceneItem[]; motion: MotionProfile } {
  // the opening screen is the home-page film, not the drawn head
  if (!stage) return { items: [], motion: "drift" };
  const motion = stageById[stage].motion;
  switch (stage) {
    // exploring happens inside the home-page film (`VideoIntro`), not the drawn head
    case "exploring": return { items: [], motion };
    case "shortlisting": return { items: composeShortlisting(phase > 0), motion };
    case "applying": return { items: composeApplying(phase), motion };
    case "offer": return { items: composeOffer(phase > 0, profile), motion };
  }
}

/** How many beats each stage's scene plays before it holds still. */
export const STAGE_BEATS: Record<Stage, number> = { exploring: 0, shortlisting: 1, applying: 6, offer: 1 };
/** The frame shown when motion is reduced: the stage's point, without the journey there. */
export const STAGE_STILL: Record<Stage, number> = { exploring: 0, shortlisting: 1, applying: 3, offer: 1 };

/* ── Stage shells ─────────────────────────────────────────────────────── */

/** Shortlisting: scattered tabs and universities snap into ambitious / target / safe. */
export function composeShortlisting(organised: boolean): SceneItem[] {
  const cards: SceneItem[] = shortlistUniversities.map((u, i) => {
    const place = organised ? shortlistColumns.cards[i] : shortlistChaos[i];
    return {
      id: u.id,
      art: { kind: "card", label: u.label, sub: u.sub, done: organised && i % 2 === 0 },
      at: place.at,
      lg: place.lg,
      rotate: organised ? 0 : shortlistChaos[i].rotate,
      depth: 0.5 + (i % 3) * 0.15,
      still: organised,
    };
  });
  if (!organised) return [...cards, ...shortlistNoise];
  const labels: SceneItem[] = shortlistColumns.labels.map((l, i) => ({
    id: l.id, art: { kind: "stamp", label: l.label, tone: (["coral", "royal", "sky"] as const)[i] }, at: l.at, lg: l.lg, rotate: -4, still: true, depth: 0.3,
  }));
  return [...labels, ...cards, { ...shortlistFolder, focus: true, still: true }];
}

/** Applying: documents travel from the pending pile, through review, to the done stack. */
export function composeApplying(tick: number): SceneItem[] {
  const docs = applicationDocuments.slice(0, 6);
  const items: SceneItem[] = docs.map((d, i) => {
    const art: ArtSpec = { kind: "doc", label: d.label };
    if (i < tick) {
      const n = i;
      return {
        id: `doc-${d.id}`, art: { ...art, done: true },
        at: { x: applyingPiles.done.at.x + n * 1.2, y: applyingPiles.done.at.y + n * 3.2 },
        lg: { x: applyingPiles.done.lg.x + n * 0.8, y: applyingPiles.done.lg.y + n * 3 },
        rotate: n % 2 ? 4 : -3, depth: 0.6, still: true,
      };
    }
    if (i === tick) {
      return { id: `doc-${d.id}`, art, ...applyingPiles.active, rotate: 0, scale: 1.35, focus: true, still: true, pulse: true, depth: 0.8 };
    }
    const n = i - tick - 1;
    return {
      id: `doc-${d.id}`, art,
      at: { x: applyingPiles.pending.at.x - n * 1.2, y: applyingPiles.pending.at.y + n * 3.2 },
      lg: { x: applyingPiles.pending.lg.x - n * 0.8, y: applyingPiles.pending.lg.y + n * 3 },
      rotate: n % 2 ? -5 : 3, depth: 0.4, still: true,
    };
  });
  const ready: SceneItem = {
    id: "ready",
    art: { kind: "sticker", label: tick >= docs.length ? "Ready to submit" : `${tick}/${docs.length} documents ready`, tone: tick >= docs.length ? "royal" : "ivory" },
    at: { x: 50, y: 45 }, lg: { x: 50, y: 44 }, rotate: -2, still: true, depth: 0.9,
  };
  return [...items, ...applyingExtras.map((e) => (e.id === "dl-1" ? { ...e, pulse: true, still: true } : { ...e, still: true })), ready];
}

/** Offer: the clutter clears, the letter takes over, the passport is stamped and the ticket flies. */
export function composeOffer(arrived: boolean, p: UserProfile): SceneItem[] {
  const destination = p.destinations[0] ?? "uk";
  const o = offerScene;
  const place: SceneItem = {
    id: `p-${destination}`, art: { kind: "polaroid", destination }, ...o.place,
    rotate: arrived ? -3 : -9, scale: arrived ? 1.3 : 1, focus: arrived, still: arrived, depth: 0.5,
  };
  const ticket: SceneItem = {
    id: "ticket", art: { kind: "ticket", label: "Boarding" }, ...(arrived ? o.ticketTo : o.ticketFrom),
    rotate: arrived ? 0 : -6, depth: 0.7, still: arrived,
  };
  const base: SceneItem[] = [
    { ...o.letter, focus: arrived, scale: arrived ? 1.2 : 1, rotate: arrived ? 0 : 3, still: arrived },
    place,
    o.passport,
    { ...o.suitcase, art: { ...o.suitcase.art, done: arrived }, still: arrived },
    ticket,
  ];
  return arrived ? [...base, { ...o.stamp, still: true }] : [...base, ...o.clutter];
}
