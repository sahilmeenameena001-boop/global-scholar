import type { DisciplineId, MotionProfile, PriorityId, Stage } from "@/lib/journey/types";

/**
 * Copy and options for the "What's on your mind?" journey. Every string the
 * journey shows comes from here, so the experience can be re-worded or
 * re-ordered without touching a component.
 */

export const journeyIntro = {
  title: "What’s on your mind?",
  skip: "Skip intro",
  /**
   * The opening film. It is trimmed to end on the frame where the head is fully
   * open, so the four answers appear exactly as the thoughts do. Swap the files
   * in `/public/global-scholar/shared/` to change it; `still` is that final
   * frame, shown when motion is reduced or the video cannot play.
   */
  video: {
    src: "/global-scholar/shared/header-intro.mp4",
    poster: "/global-scholar/shared/header-start.webp",
    still: "/global-scholar/shared/header-open.webp",
    /** Give up waiting for playback after this long and show the open frame instead. */
    stallMs: 2500,
  },
};

/** The four first-level answers, and how each stage looks and moves. */
export type StageConfig = {
  id: Stage;
  /** The thought the student taps on the opening screen. */
  cta: string;
  /** The line that appears on that thought while it is hovered or focused. */
  hoverCta: string;
  /** Dream → Decide → Do → Depart. */
  arc: string;
  /** Chaos → Clarity → Execution → Arrival. */
  mood: string;
  motion: MotionProfile;
  title: string;
  lede: string;
  primary: string;
  secondary: string;
  /** Lead context passed to the counsellor form. */
  enquiry: string;
  /** Marks a stage whose step-by-step flow has not shipped yet. */
  preview?: { note: string; steps: string[] };
};

export const stages: StageConfig[] = [
  {
    id: "exploring",
    hoverCta: "Explore my possibilities",
    cta: "I’m just exploring",
    arc: "Dream",
    mood: "Possibility",
    motion: "drift",
    title: "So many possibilities.",
    lede: "Course, country, cost, timing: it’s a lot to hold at once. Let’s sort the thoughts, one at a time.",
    primary: "Help me figure it out",
    secondary: "I already have something in mind",
    enquiry: "Exploring study-abroad options",
  },
  {
    id: "shortlisting",
    hoverCta: "Build my shortlist",
    cta: "I’m choosing where to apply",
    arc: "Decide",
    mood: "Clarity",
    motion: "snap",
    title: "Too many tabs open.",
    lede: "Let’s turn the universities you’re weighing into a shortlist: ambitious, target and safe.",
    primary: "Build my shortlist",
    secondary: "Compare universities I already have",
    enquiry: "Help building a university shortlist",
    preview: {
      note: "The shortlist builder is being finished. A counsellor can build yours with you today.",
      steps: ["Course", "Destinations", "Intake", "Profile", "Priorities", "Ambitious · Target · Safe"],
    },
  },
  {
    id: "applying",
    hoverCta: "Build my application plan",
    cta: "I’m applying now",
    arc: "Do",
    mood: "Execution",
    motion: "pipeline",
    title: "Every document, moving.",
    lede: "SOPs, transcripts, references and deadlines, kept moving so nothing slips.",
    primary: "Build my application plan",
    secondary: "Continue an application",
    enquiry: "Support with live university applications",
    preview: {
      note: "The application planner is being finished. A counsellor can map your deadlines with you today.",
      steps: ["Universities", "Status", "Documents", "Deadlines", "Next task", "Progress"],
    },
  },
  {
    id: "offer",
    hoverCta: "Plan my move",
    cta: "I already have an offer",
    arc: "Depart",
    mood: "Arrival",
    motion: "settle",
    title: "The letter says yes.",
    lede: "Now it’s deposit, visa, somewhere to live and a flight. Let’s plan the move.",
    primary: "Plan my move",
    secondary: "I have multiple offers",
    enquiry: "Pre-departure planning after receiving an offer",
    preview: {
      note: "The move planner is being finished. A counsellor can walk you through visa and departure today.",
      steps: ["Offer", "Deposit", "Visa", "Accommodation", "Flight", "Arrival"],
    },
  },
];

export const stageById = Object.fromEntries(stages.map((s) => [s.id, s])) as Record<Stage, StageConfig>;

/* ── Exploring ───────────────────────────────────────────────────────── */

/** `short` is the word used in the personalised reveal, e.g. "Business + UK + Sep 2027". */
export type Option<T extends string = string> = { id: T; label: string; short: string; icon?: string };

export const disciplines: Option<DisciplineId>[] = [
  { id: "business", label: "Business & Management", short: "Business", icon: "chart" },
  { id: "technology", label: "Technology & Computing", short: "Technology", icon: "laptop" },
  { id: "engineering", label: "Engineering", short: "Engineering", icon: "cog" },
  { id: "law", label: "Law & Social Sciences", short: "Law", icon: "scale" },
  { id: "medicine", label: "Medicine & Life Sciences", short: "Life Sciences", icon: "stethoscope" },
  { id: "design", label: "Design & Creative", short: "Design", icon: "palette" },
  { id: "undecided", label: "Not sure yet", short: "Open mind", icon: "sparkles" },
];

/** "Help me decide" — destinations chosen for the student from their priorities. */
export const DECIDE = "decide";

export const priorities: Option<PriorityId>[] = [
  { id: "reputation", label: "Best universities", short: "Top universities", icon: "graduation" },
  { id: "career", label: "Career opportunities", short: "Career", icon: "briefcase" },
  { id: "affordable", label: "Affordability", short: "Affordability", icon: "wallet" },
  { id: "scholarships", label: "Scholarships", short: "Scholarships", icon: "award" },
  { id: "postStudyWork", label: "Post-study work", short: "Post-study work", icon: "plane" },
  { id: "studentLife", label: "Student life", short: "Student life", icon: "music" },
  { id: "fit", label: "Best overall fit", short: "Best fit", icon: "sparkles" },
];

export const MAX_PRIORITIES = 3;

/**
 * Intakes on offer. Edit this list as the calendar moves on; `undecided` is
 * the "Not sure yet" answer and is always kept last.
 */
export const intakes: Option[] = [
  { id: "2027-01", label: "Jan 2027", short: "Jan 2027" },
  { id: "2027-09", label: "Sep 2027", short: "Sep 2027" },
  { id: "2028-01", label: "Jan 2028", short: "Jan 2028" },
  { id: "2028-09", label: "Sep 2028", short: "Sep 2028" },
  { id: "undecided", label: "Not sure yet", short: "Timing open" },
];

/** Every string in the exploring funnel. */
export const exploringCopy = {
  course: { prompt: "What do you want to study?", hint: "Hover to peek inside. Pick to keep it." },
  destination: { prompt: "Where do you see yourself?", hint: "Picture it. Pick the one that feels right.", decide: "Help me decide" },
  intake: { prompt: "When do you want to go?", hint: "A rough idea is fine." },
  priorities: { prompt: "What matters most to you?", hint: `Pick up to ${MAX_PRIORITIES}.` },
  locked: "Your journey",
  change: "Change",
  back: "Back",
  reveal: "Reveal my world",
  maxed: `That’s ${MAX_PRIORITIES}. Drop one to swap it.`,
  pickOne: "Pick at least one.",
  pins: "Your answers so far",
  edit: "Change",
  result: {
    eyebrow: "Your world, sorted",
    lede: "Everything you told us, in one place.",
    suggested: "suggested from your priorities",
    primary: "Show me my best-fit options",
    secondary: "Talk to a counsellor",
    restart: "Rethink my answers",
    disclaimer: "Indicative only, based on your answers. A counsellor checks fees, scholarships and current rules with you.",
    modal: "Talk to a counsellor",
  },
};

/** Shared copy for stages whose step-by-step flow is still being built. */
export const shellCopy = {
  covers: "What the full planner covers",
  counsellor: "Plan it with a counsellor",
  explore: "Not sure yet? Start by exploring",
  carry: "Starting from what you told us",
  modal: "Talk to a counsellor",
};

/** The narrative arc rendered by `JourneyProgress`. */
export const journeyArc = stages.map((s) => ({ id: s.id, arc: s.arc, mood: s.mood }));
