import type { ArtSpec, Point, SceneItem } from "@/lib/journey/types";

/**
 * The collage catalogue: every object that can appear inside the head.
 *
 * Coordinates are percentages of the thought canvas — `at` for the mobile
 * reference composition (10:11), `lg` for the wider desktop canvas (16:11).
 * The head sits bottom-centre with its opening at roughly (50, 62).
 *
 * Replacing a drawing with final art: drop a file in
 * `/public/global-scholar/<stage>/` and set `src` (and `alt`) on its entry.
 * Nothing else changes. Until then each object is drawn in code.
 *
 * Objects only — passports, letters, tickets, landmarks. The thinker and any
 * other person stay drawn (see the project rules): no stock photos of people,
 * so nothing here can be mistaken for a real student.
 */

type Extra = Omit<SceneItem, "id" | "art" | "at" | "lg">;
const item = (id: string, art: ArtSpec, at: Point, lg?: Point, extra: Extra = {}): SceneItem => ({ id, art, at, lg, ...extra });

/** Where every new thought is born and every dismissed one returns to. */
export const HEAD_OPENING: Point = { x: 50, y: 62 };

/* ── Stage shells ─────────────────────────────────────────────────────
   Two phases each: the overwhelm the student arrives with, then the order
   the stage brings to it. */

export const shortlistUniversities = [
  { id: "u-northbridge", label: "Northbridge", sub: "UK" },
  { id: "u-redwood", label: "Redwood State", sub: "USA" },
  { id: "u-lakeshore", label: "Lakeshore Tech", sub: "Canada" },
  { id: "u-rheinland", label: "Rheinland TU", sub: "Germany" },
  { id: "u-coastal", label: "Coastal Pacific", sub: "Australia" },
  { id: "u-harbour", label: "Harbourside", sub: "UK" },
];

export const shortlistChaos: { at: Point; lg: Point; rotate: number }[] = [
  { at: { x: 22, y: 12 }, lg: { x: 18, y: 14 }, rotate: -9 },
  { at: { x: 74, y: 8 }, lg: { x: 60, y: 8 }, rotate: 7 },
  { at: { x: 60, y: 36 }, lg: { x: 84, y: 30 }, rotate: -5 },
  { at: { x: 20, y: 44 }, lg: { x: 30, y: 40 }, rotate: 6 },
  { at: { x: 84, y: 52 }, lg: { x: 88, y: 58 }, rotate: -8 },
  { at: { x: 40, y: 24 }, lg: { x: 44, y: 22 }, rotate: 4 },
];

/** Ambitious, target, safe — two cards per column. */
export const shortlistColumns = {
  labels: [
    { id: "l-ambitious", label: "Ambitious", at: { x: 18, y: 5 }, lg: { x: 22, y: 7 } },
    { id: "l-target", label: "Target", at: { x: 50, y: 5 }, lg: { x: 50, y: 7 } },
    { id: "l-safe", label: "Safe", at: { x: 82, y: 5 }, lg: { x: 78, y: 7 } },
  ],
  cards: [
    { at: { x: 18, y: 19 }, lg: { x: 22, y: 21 } }, { at: { x: 18, y: 35 }, lg: { x: 22, y: 37 } },
    { at: { x: 50, y: 19 }, lg: { x: 50, y: 21 } }, { at: { x: 50, y: 35 }, lg: { x: 50, y: 37 } },
    { at: { x: 82, y: 19 }, lg: { x: 78, y: 21 } }, { at: { x: 82, y: 35 }, lg: { x: 78, y: 37 } },
  ],
};

export const shortlistNoise: SceneItem[] = [
  item("tab-rank", { kind: "tab", label: "Rankings 2027" }, { x: 76, y: 24 }, { x: 74, y: 18 }, { rotate: 3, depth: 0.4 }),
  item("tab-fees", { kind: "tab", label: "Fees compared" }, { x: 30, y: 58 }, { x: 12, y: 54 }, { rotate: -4, depth: 0.6 }),
  item("c-star", { kind: "chip", icon: "star" }, { x: 9, y: 26 }, { x: 8, y: 30 }, { depth: 0.7 }),
  item("c-calc", { kind: "chip", icon: "calculator" }, { x: 92, y: 36 }, { x: 92, y: 42 }, { depth: 0.5 }),
  item("c-pin", { kind: "chip", icon: "pin" }, { x: 48, y: 50 }, { x: 64, y: 48 }, { depth: 0.3 }),
];

export const shortlistFolder = item("folder", { kind: "note", label: "My shortlist", sub: "6 universities", tone: "sky" }, { x: 50, y: 52 }, { x: 50, y: 54 }, { rotate: -2, depth: 0.8 });

export const applyingPiles = {
  pending: { at: { x: 15, y: 22 }, lg: { x: 18, y: 24 } },
  active: { at: { x: 50, y: 24 }, lg: { x: 50, y: 22 } },
  done: { at: { x: 85, y: 22 }, lg: { x: 82, y: 24 } },
};

export const applyingExtras: SceneItem[] = [
  item("dl-1", { kind: "calendar", label: "18", sub: "days left", tone: "coral" }, { x: 22, y: 52 }, { x: 14, y: 58 }, { rotate: -4, depth: 0.7 }),
  item("dl-2", { kind: "calendar", label: "32", sub: "days left", tone: "ivory" }, { x: 80, y: 54 }, { x: 86, y: 60 }, { rotate: 5, depth: 0.5, scale: 0.85 }),
  item("dl-3", { kind: "calendar", label: "47", sub: "days left", tone: "ivory" }, { x: 0, y: 0 }, { x: 70, y: 82 }, { rotate: -3, depth: 0.4, scale: 0.75, wide: true }),
  item("portal", { kind: "tab", label: "Application portal" }, { x: 0, y: 0 }, { x: 22, y: 84 }, { rotate: -2, depth: 0.6, wide: true }),
];

export const offerScene = {
  letter: item("letter", { kind: "letter", label: "Offer of admission" }, { x: 50, y: 22 }, { x: 50, y: 22 }, { depth: 0.6 }),
  place: { at: { x: 18, y: 12 }, lg: { x: 20, y: 16 } },
  passport: item("passport", { kind: "passport" }, { x: 16, y: 44 }, { x: 18, y: 50 }, { rotate: -8, depth: 0.8 }),
  stamp: item("stamp", { kind: "stamp", label: "Visa", tone: "coral" }, { x: 21, y: 48 }, { x: 22, y: 54 }, { rotate: -14, depth: 0.9 }),
  suitcase: item("suitcase", { kind: "suitcase" }, { x: 84, y: 44 }, { x: 82, y: 48 }, { rotate: 4, depth: 0.7 }),
  ticketFrom: { at: { x: 18, y: 76 }, lg: { x: 14, y: 82 } },
  ticketTo: { at: { x: 82, y: 76 }, lg: { x: 86, y: 82 } },
  clutter: [
    item("q-deposit", { kind: "note", label: "Deposit?", tone: "ivory" }, { x: 80, y: 10 }, { x: 82, y: 12 }, { rotate: 6, depth: 0.5 }),
    item("q-visa", { kind: "note", label: "Visa?!", tone: "coral" }, { x: 82, y: 62 }, { x: 88, y: 30 }, { rotate: -5, depth: 0.7 }),
    item("q-live", { kind: "note", label: "Where will I live?", tone: "sky" }, { x: 0, y: 0 }, { x: 34, y: 38 }, { rotate: 3, depth: 0.4, wide: true }),
    item("c-wallet", { kind: "chip", icon: "wallet" }, { x: 10, y: 64 }, { x: 64, y: 40 }, { depth: 0.5 }),
  ] as SceneItem[],
};
