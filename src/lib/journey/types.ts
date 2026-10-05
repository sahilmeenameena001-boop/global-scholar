/**
 * Shared vocabulary for the study-abroad journey. Content lives in
 * `src/data/journey/*`; these types are the contract between that content, the
 * world composers in `worlds.ts` and the components that render them.
 */

export const STAGES = ["exploring", "shortlisting", "applying", "offer"] as const;
export type Stage = (typeof STAGES)[number];
export const isStage = (v: unknown): v is Stage => typeof v === "string" && (STAGES as readonly string[]).includes(v);

export type DisciplineId = "business" | "technology" | "engineering" | "law" | "medicine" | "design" | "undecided";
export type DestinationId = "uk" | "usa" | "canada" | "australia" | "europe";
export const PRIORITY_IDS = ["reputation", "career", "affordable", "scholarships", "postStudyWork", "studentLife", "fit"] as const;
export type PriorityId = (typeof PRIORITY_IDS)[number];
/** What matters when choosing a university (the shortlisting question, distinct from exploring's). */
export const UNI_PRIORITY_IDS = ["reputation", "employability", "courseQuality", "scholarships", "lowerTuition", "location", "postStudyWork", "studentLife"] as const;
export type UniPriorityId = (typeof UNI_PRIORITY_IDS)[number];

/* ── Applying ── */
export const APP_STATUSES = ["notStarted", "inProgress", "submitted", "interview", "docsRequested", "awaiting", "decision", "rejected"] as const;
export type AppStatus = (typeof APP_STATUSES)[number];
export const APP_TASKS = ["sop", "cv", "transcripts", "lor", "tests", "passport", "portfolio", "fee", "extra"] as const;
export type AppTask = (typeof APP_TASKS)[number];
export const DEADLINE_KINDS = ["application", "scholarship", "documents", "interview", "deposit"] as const;
export type DeadlineKind = (typeof DEADLINE_KINDS)[number];
export const HELP_IDS = ["sop", "cv", "check", "lor", "documents", "interview", "none"] as const;
export type HelpId = (typeof HELP_IDS)[number];

/**
 * One application the student is tracking. `university` is a catalogue id,
 * or `custom:<name>` for a university the student typed in themselves.
 * Dates are ISO `YYYY-MM-DD`.
 */
export type Application = {
  university: string;
  status: AppStatus;
  pending: AppTask[];
  dates: Partial<Record<DeadlineKind, string>>;
};

/* ── Offer & departure ── */
export const OFFER_SITUATIONS = ["one", "multiple", "conditional", "waiting"] as const;
export type OfferSituation = (typeof OFFER_SITUATIONS)[number];
export type OfferCondition = { id: string; label: string; complete: boolean };

/** One offer. Amounts are in the destination's currency, as the student entered them. */
export type Offer = {
  id: string;
  /** Catalogue id or `custom:<name>`, as for applications. */
  university: string;
  country: DestinationId | null;
  type: "conditional" | "unconditional";
  tuition?: number;
  scholarshipAmount?: number;
  depositAmount?: number;
  depositDeadline?: string;
  depositPaid: boolean;
  conditions: OfferCondition[];
  accepted: boolean;
};

export type VisaItemStatus = "notStarted" | "inProgress" | "done";

/** Everything for the move, once an offer is chosen. */
export type Departure = {
  visa: Record<string, VisaItemStatus>;
  funding: { tuition?: number; scholarship?: number; paid?: number; livingCost?: number; family?: number; loan?: number };
  accommodation: { preference: string | null; budget?: number; commute: string | null; sharing: string | null; status: string | null };
  /** Travel checklist items done. */
  travel: string[];
  departureDate: string | null;
};

export const emptyDeparture: Departure = {
  visa: {}, funding: {}, accommodation: { preference: null, commute: null, sharing: null, status: null }, travel: [], departureDate: null,
};

/**
 * Where the student is on the whole road. Only four are chosen directly (the
 * home film's cards); the rest follow from what the student records —
 * everything submitted means waiting, a confirmed offer means departure.
 */
export const LIFECYCLE = ["anonymous", "exploring", "shortlisting", "applying", "waiting", "offer", "departure", "arrival"] as const;
export type LifecycleStage = (typeof LIFECYCLE)[number];

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
  /** Academic fit, all ids from the option lists in `config.ts`. */
  qualification: string | null;
  academicScore: string | null;
  tests: string[];
  workExperience: string | null;
  uniPriorities: UniPriorityId[];
  /** "own" — the student brought universities; "recommend" — we suggested them. */
  shortlistMode: "own" | "recommend" | null;
  /** Universities the student added themselves, before evaluation. */
  ownUniversities: string[];
  /** The working shortlist, in the student's order. University ids. */
  shortlist: string[];
  /** Universities the student starred as definitely pursuing. */
  savedUniversities: string[];
  applications: Application[];
  /** Application tasks the student wants help with. */
  helpNeeded: HelpId[];
  offerSituation: OfferSituation | null;
  offers: Offer[];
  /** The offer the student is choosing; set by "I'm choosing this university". */
  selectedOfferId: string | null;
  /** Explicit confirmation that moves the journey into departure mode. */
  departureConfirmed: boolean;
  departure: Departure;
  /** The student has left their details (plan saved or counsellor requested). */
  leadCaptured: boolean;
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
  workExperience: null,
  uniPriorities: [],
  shortlistMode: null,
  ownUniversities: [],
  shortlist: [],
  savedUniversities: [],
  applications: [],
  helpNeeded: [],
  offerSituation: null,
  offers: [],
  selectedOfferId: null,
  departureConfirmed: false,
  departure: emptyDeparture,
  leadCaptured: false,
};

/** Exploring, in order: Course → Destination → Intake → Priorities → personalised reveal. */
export const EXPLORING_STEPS = ["course", "destination", "intake", "priorities", "result"] as const;
export type ExploringStep = (typeof EXPLORING_STEPS)[number];

/**
 * Shortlisting: Course → Countries → Intake → Academic fit → Priorities →
 * Universities in mind? → Shortlist reveal → Compare → Finalise.
 */
export const SHORTLIST_STEPS = ["course", "countries", "intake", "fit", "priorities", "existing", "reveal", "compare", "finalise"] as const;
export type ShortlistStep = (typeof SHORTLIST_STEPS)[number];
export type Bucket = "ambitious" | "target" | "safe";

/**
 * Applying: Universities applied to → Status → Pending → Deadlines → Help →
 * Dashboard → Next best action.
 */
export const APPLY_STEPS = ["universities", "status", "pending", "deadlines", "help", "dashboard", "next"] as const;
export type ApplyStep = (typeof APPLY_STEPS)[number];

/**
 * Offer & departure: situation → offers → acceptance → conditions → visa →
 * funding → accommodation → travel → my move.
 */
export const OFFER_STEPS = ["situation", "offers", "acceptance", "conditions", "visa", "funding", "accommodation", "travel", "move"] as const;
export type OfferStep = (typeof OFFER_STEPS)[number];

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
  /** Allowed to break out of the head's opening (a plane, a sticky note). Use sparingly. */
  overflow?: boolean;
};
