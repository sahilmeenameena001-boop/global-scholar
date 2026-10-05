/**
 * Shared vocabulary for the study-abroad journey. Content lives in
 * `src/data/journey/*`; these types are the contract between that content, the
 * scene composers in `scenes.ts` and the components that render them.
 */

export const STAGES = ["exploring", "shortlisting", "applying", "offer"] as const;
export type Stage = (typeof STAGES)[number];
export const isStage = (v: unknown): v is Stage => typeof v === "string" && (STAGES as readonly string[]).includes(v);

export type DisciplineId = "business" | "technology" | "engineering" | "law" | "medicine" | "design" | "undecided";
export type DestinationId = "uk" | "usa" | "canada" | "australia" | "europe";
export const PRIORITY_IDS = ["reputation", "career", "affordable", "scholarships", "postStudyWork", "studentLife", "fit"] as const;
export type PriorityId = (typeof PRIORITY_IDS)[number];

/** Everything the journey knows about the student. Persisted as-is. */
export type UserProfile = {
  journeyStage: Stage | null;
  discipline: DisciplineId | null;
  course: string | null;
  destinations: DestinationId[];
  /** "Compare countries for me" — the student wants us to suggest destinations. */
  openDestination: boolean;
  /** An intake id from `intakes`, or "undecided". */
  intake: string | null;
  priorities: PriorityId[];
  qualification: string | null;
  academicScore: string | null;
  tests: string[];
  shortlist: string[];
  applications: { university: string; status: string }[];
  offers: { university: string; course: string; city: string; intake: string }[];
};

export const emptyProfile: UserProfile = {
  journeyStage: null,
  discipline: null,
  course: null,
  destinations: [],
  openDestination: false,
  intake: null,
  priorities: [],
  qualification: null,
  academicScore: null,
  tests: [],
  shortlist: [],
  applications: [],
  offers: [],
};

/** Exploring, in order: Course → Destination → Intake → Priorities → personalised reveal. */
export const EXPLORING_STEPS = ["course", "destination", "intake", "priorities", "result"] as const;
export type ExploringStep = (typeof EXPLORING_STEPS)[number];

/** The whole persisted document. Bump `version` when the shape changes incompatibly. */
export type JourneyState = {
  version: 1;
  profile: UserProfile;
  /** Where the student is inside each stage, so every stage resumes on its own. */
  steps: Partial<Record<Stage, string>>;
  updatedAt: number | null;
};

/* ── Scene ───────────────────────────────────────────────────────────── */

/** A point on the thought canvas, in percent of its width and height. */
export type Point = { x: number; y: number };

/**
 * How a set of thoughts behaves. Each stage has its own temperament: open-ended
 * drift while exploring, a spring snap when shortlisting, a steady conveyor
 * when applying, and a slow settle once an offer arrives.
 */
export type MotionProfile = "drift" | "snap" | "pipeline" | "settle";

export type ArtKind =
  | "note" | "sticker" | "chip" | "polaroid" | "passport" | "ticket" | "calendar"
  | "card" | "doc" | "letter" | "tab" | "glyph" | "stamp" | "suitcase";

/**
 * One replaceable visual. `src` is the slot for final imagery: leave it unset
 * and the object is drawn in code; set it to a file under
 * `/public/global-scholar/*` and the image replaces the drawing with no
 * component change.
 */
export type ArtSpec = {
  kind: ArtKind;
  /** Short visible text on the object (a note's question, a sticker's word). */
  label?: string;
  /** Secondary line, e.g. a card's subtitle. */
  sub?: string;
  /** lucide icon name from the curated set in `ThoughtArt`. */
  icon?: string;
  /** Destination for `polaroid` art. */
  destination?: DestinationId;
  /** Paper tint for notes and stickers. */
  tone?: "ivory" | "sky" | "coral" | "royal" | "ink";
  /** A tick in the corner — used for completed items. */
  done?: boolean;
  src?: string;
  /** Required when `src` is set. Drawn art is decorative and stays aria-hidden. */
  alt?: string;
};

export type SceneItem = {
  id: string;
  art: ArtSpec;
  /** Mobile placement — the reference composition. */
  at: Point;
  /** Desktop placement; falls back to `at`. */
  lg?: Point;
  rotate?: number;
  /** 0.5 – 1.6. Multiplies the drawn size. */
  scale?: number;
  /** Parallax depth, 0 (far) – 1 (near). */
  depth?: number;
  /** Desktop only — the wider canvas has room for more thoughts. */
  wide?: boolean;
  /** Visually emphasised: lifted, larger, on top. */
  focus?: boolean;
  /** Pushed back but still present. */
  dim?: boolean;
  /** Slow pulse for something that needs attention. */
  pulse?: boolean;
  /** No idle drift — a thought that has settled. */
  still?: boolean;
};
