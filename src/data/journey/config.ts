import type { AppStatus, AppTask, Bucket, DeadlineKind, DisciplineId, HelpId, MotionProfile, PriorityId, Stage, UniPriorityId } from "@/lib/journey/types";

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
  },
  {
    id: "applying",
    hoverCta: "Track my applications",
    cta: "I’m applying now",
    arc: "Do",
    mood: "Execution",
    motion: "pipeline",
    title: "Every document, moving.",
    lede: "SOPs, transcripts, references and deadlines, kept moving so nothing slips.",
    primary: "Build my application plan",
    secondary: "Continue an application",
    enquiry: "Support with live university applications",
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

/* ── Shortlisting ────────────────────────────────────────────────────── */

export const qualifications: Option[] = [
  { id: "grade12", label: "Grade 12", short: "Grade 12" },
  { id: "bachelors", label: "Bachelor’s", short: "Bachelor’s" },
  { id: "masters", label: "Master’s", short: "Master’s" },
  { id: "other", label: "Other", short: "Other" },
];
/** Qualifications that lead to postgraduate study, where work experience is worth asking about. */
export const POSTGRAD_FROM = ["bachelors", "masters"];

/** Score bands. `level` (1–5) is compared with each university's selectivity. */
export const scoreBands: (Option & { level: number })[] = [
  { id: "lt55", label: "Below 55%", short: "<55%", level: 1 },
  { id: "55-65", label: "55–65%", short: "55–65%", level: 2 },
  { id: "65-75", label: "65–75%", short: "65–75%", level: 3 },
  { id: "75-85", label: "75–85%", short: "75–85%", level: 4 },
  { id: "85+", label: "85% or above", short: "85%+", level: 5 },
];

export const tests: Option[] = [
  { id: "ielts", label: "IELTS", short: "IELTS" },
  { id: "toefl", label: "TOEFL", short: "TOEFL" },
  { id: "pte", label: "PTE", short: "PTE" },
  { id: "gre", label: "GRE", short: "GRE" },
  { id: "gmat", label: "GMAT", short: "GMAT" },
  { id: "none", label: "Not taken yet", short: "No tests yet" },
];

export const workExperience: Option[] = [
  { id: "none", label: "None", short: "No work experience" },
  { id: "lt2", label: "Under 2 years", short: "<2 yrs experience" },
  { id: "2-5", label: "2–5 years", short: "2–5 yrs experience" },
  { id: "5+", label: "5+ years", short: "5+ yrs experience" },
];

export const uniPriorities: Option<UniPriorityId>[] = [
  { id: "reputation", label: "Reputation / ranking", short: "Ranking", icon: "graduation" },
  { id: "employability", label: "Employability", short: "Employability", icon: "briefcase" },
  { id: "courseQuality", label: "Course quality", short: "Course quality", icon: "star" },
  { id: "scholarships", label: "Scholarships", short: "Scholarships", icon: "award" },
  { id: "lowerTuition", label: "Lower tuition", short: "Lower tuition", icon: "wallet" },
  { id: "location", label: "Location", short: "Location", icon: "pin" },
  { id: "postStudyWork", label: "Post-study work", short: "Post-study work", icon: "plane" },
  { id: "studentLife", label: "Student life", short: "Student life", icon: "music" },
];

export const MAX_COMPARE = 4;

export const bucketCopy: Record<Bucket, { label: string; note: string; reason: string }> = {
  ambitious: { label: "Ambitious", note: "A stretch. Worth a strong application.", reason: "a stretch for your current scores" },
  target: { label: "Target", note: "Your profile sits in their usual range.", reason: "your profile sits in its usual range" },
  safe: { label: "Safe", note: "Comfortably within reach.", reason: "comfortably within reach for your profile" },
};

export const shortlistCopy = {
  course: { prompt: "What do you want to study?", hint: "Pick an area, then the course. Or search for it.", search: "Search for a course", searchPlaceholder: "e.g. Data Science", noMatch: "No course matches that yet. Try a broader word.", anyCourse: "Any course in this area" },
  countries: { prompt: "Where are you considering?", hint: "Pick as many as you like.", open: "I’m open to recommendations" },
  intake: { prompt: "When do you want to start?", hint: "A rough idea is fine." },
  fit: {
    prompt: "Tell us your academic fit", hint: "Four quick taps. Approximate is fine.",
    qualification: "Current qualification", score: "Approximate score / GPA / percentage", scoreHint: "Use the nearest percentage equivalent.",
    tests: "Tests taken (if any)", work: "Work experience (optional, for postgraduate courses)",
    missing: "Pick your qualification and an approximate score to continue.",
  },
  priorities: { prompt: "What matters most when choosing a university?", hint: "Pick up to 3." },
  existing: {
    prompt: "Do you already have universities in mind?", hint: "Bring your own list, or let us suggest one.",
    yes: "Yes, add my universities", no: "No, recommend them for me",
    search: "Search universities", searchPlaceholder: "Name or city", added: "Added", none: "No university matches that.",
    compare: "Compare them against my profile", recommend: "Build my shortlist", needOne: "Add at least one university.",
  },
  reveal: { eyebrow: "Your shortlist", title: (n: number) => `${n} universities, sorted by how you fit`, compare: "Compare universities", finalise: "Finalise my shortlist", empty: "Nothing matched every answer. Try more countries or another intake." },
  card: { fit: "Fit", course: "Course", tuition: "Tuition", deadline: "Apply by", scholarship: "Scholarships", why: "Why it matches",
    scholarshipLevel: { strong: "Merit awards common", some: "Some awards", limited: "Limited awards" } },
  compare: {
    prompt: "Compare your options", hint: `Pick 2 to ${MAX_COMPARE} universities.`, pick: "Select to compare", picked: "Comparing",
    tooMany: `You can compare up to ${MAX_COMPARE} at a time.`, region: "Comparison table",
    dims: {
      course: "Course relevance", fit: "Academic fit", ranking: "Reputation", employability: "Employability", career: "Career outcome",
      fees: "Tuition", scholarship: "Scholarships", living: "Living costs", city: "Location", postStudy: "Post-study work",
      deadline: "Deadline", difficulty: "Application difficulty",
    },
    matters: "Matters to you",
    rating: ["Limited", "Fair", "Good", "Strong", "Excellent"],
    difficulty: ["Very accessible", "Accessible", "Moderate", "Competitive", "Highly competitive"],
    next: "Finalise my shortlist",
  },
  finalise: {
    prompt: "Your final shortlist", hint: "Star the ones you will definitely pursue, put them in order, drop the rest.",
    save: "Save", saved: "Saved", remove: "Remove", up: "Move up", down: "Move down", add: "Add another university",
    count: (n: number) => `My shortlist: ${n} ${n === 1 ? "university" : "universities"}`,
    start: "Start application", tracking: "Tracking",
    primary: "Turn this into my application plan", secondary: "Review with a counsellor", modal: "Review your shortlist with a counsellor",
  },
  next: "Continue",
  back: "Back",
  pins: "Your answers so far",
  edit: "Change",
  maxed: "That’s 3. Drop one to swap it.",
  pickOne: "Pick at least one.",
  disclaimer: "Illustrative universities and figures for this demo. Fit, ranking bands, fees and deadlines are indicative only; a counsellor confirms the real position with you.",
};

/* ── Applying ────────────────────────────────────────────────────────── */

/** `tone` colours the status everywhere it appears. `done` statuses count as submitted. */
export const appStatuses: (Option<AppStatus> & { tone: "faint" | "sky" | "royal" | "coral" | "ivory"; done: boolean })[] = [
  { id: "notStarted", label: "Not started", short: "Not started", tone: "faint", done: false },
  { id: "inProgress", label: "In progress", short: "In progress", tone: "sky", done: false },
  { id: "submitted", label: "Submitted", short: "Submitted", tone: "royal", done: true },
  { id: "interview", label: "Interview / assessment", short: "Interview", tone: "coral", done: true },
  { id: "docsRequested", label: "Additional documents requested", short: "Docs requested", tone: "coral", done: true },
  { id: "awaiting", label: "Awaiting decision", short: "Awaiting decision", tone: "royal", done: true },
  { id: "decision", label: "Decision received", short: "Decision received", tone: "ivory", done: true },
  { id: "rejected", label: "Unsuccessful", short: "Unsuccessful", tone: "faint", done: true },
];

/** `verb` builds the next action, e.g. "Finish" + "Northbridge" + "SOP". In urgency order. */
export const appTasks: (Option<AppTask> & { verb: string })[] = [
  { id: "sop", label: "SOP / personal statement", short: "SOP", verb: "Finish" },
  { id: "lor", label: "LOR", short: "recommendation letter", verb: "Request" },
  { id: "tests", label: "IELTS / TOEFL / GRE / GMAT", short: "test scores", verb: "Send" },
  { id: "transcripts", label: "Transcripts", short: "transcript", verb: "Upload" },
  { id: "cv", label: "CV", short: "CV", verb: "Update" },
  { id: "portfolio", label: "Portfolio", short: "portfolio", verb: "Finish" },
  { id: "passport", label: "Passport", short: "passport copy", verb: "Upload" },
  { id: "extra", label: "Additional university-specific documents", short: "extra documents", verb: "Upload" },
  { id: "fee", label: "Application fee", short: "application fee", verb: "Pay" },
];

export const deadlineKinds: (Option<DeadlineKind> & { optional?: boolean })[] = [
  { id: "application", label: "Application deadline", short: "Application" },
  { id: "scholarship", label: "Scholarship deadline", short: "Scholarship" },
  { id: "documents", label: "Document deadline", short: "Documents" },
  { id: "interview", label: "Interview / assessment date", short: "Interview" },
  { id: "deposit", label: "Deposit deadline, if already known", short: "Deposit", optional: true },
];

export const helpOptions: Option<HelpId>[] = [
  { id: "sop", label: "Write / improve SOP", short: "SOP help", icon: "graduation" },
  { id: "cv", label: "Review CV", short: "CV review", icon: "briefcase" },
  { id: "check", label: "Check application", short: "Application check", icon: "star" },
  { id: "lor", label: "Prepare LOR request", short: "LOR request", icon: "award" },
  { id: "documents", label: "Check documents", short: "Document check", icon: "pin" },
  { id: "interview", label: "Prepare for interview", short: "Interview prep", icon: "music" },
  { id: "none", label: "No help needed", short: "No help needed", icon: "sparkles" },
];

/** Short how-tos shown when the student continues their next task. General guidance, not university rules. */
export const actionGuides: Record<"docs" | "task" | "submit" | "start" | "interview" | "wait" | "decision", string[]> = {
  docs: ["Open the university’s message and list exactly what they asked for.", "Send each document in the format they specify.", "Reply to confirm, then mark it done here."],
  task: ["Block an hour today for just this one item.", "Check the university’s own instructions for format and length.", "Upload or send it, then mark it done here."],
  submit: ["Re-read every section once, slowly.", "Confirm the fee is paid and every document is attached.", "Submit, save the confirmation email, then mark it done here."],
  start: ["Create your account on the university’s application portal.", "Note its exact deadline and required documents.", "Fill in the personal details section first; it’s the quickest win."],
  interview: ["Re-read your statement and the course page.", "Prepare three examples from your studies or work.", "Do one timed practice run out loud."],
  wait: ["Check your email and each portal once a week.", "Keep your documents together for the visa stage.", "Look at accommodation timelines so you’re ready to move fast."],
  decision: ["Read the offer conditions carefully.", "Note the acceptance and deposit deadlines.", "Plan your move once you’ve decided."],
};

export const applyingCopy = {
  universities: {
    prompt: "Where have you applied?", hint: "Add every university, even the ones you haven’t started.",
    fromShortlist: "From your saved shortlist", search: "Add a university", searchPlaceholder: "Search, or type any university name",
    addCustom: (name: string) => `Add “${name}”`, added: "Added", none: "No match in our list. You can still add it by name.",
    yours: "Your applications", remove: "Remove", needOne: "Add at least one university.",
  },
  status: { prompt: "What is the status of each application?", hint: "Tap the stage each one is at." },
  pending: { prompt: "What is still pending?", hint: "Tap what’s not done yet for each university.", allDone: "Nothing pending" },
  deadlines: { prompt: "What are your deadlines?", hint: "Add the dates you know. Skip the rest.", more: "More dates", fewer: "Fewer dates", days: (n: number) => (n < 0 ? `${-n} days ago` : n === 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`) },
  help: { prompt: "Do you need help with any application task?", hint: "Pick as many as you like.", toDashboard: "See my dashboard" },
  dashboard: {
    eyebrow: "Your applications", progress: (done: number, total: number) => `${done} of ${total} applications submitted`,
    deadlineIn: (n: number) => (n < 0 ? `Deadline passed ${-n} days ago` : n === 0 ? "Deadline today" : `Deadline in ${n} days`),
    pending: (task: string) => `${task} pending`, complete: "Documents complete", next: "See my next action", upcoming: "Coming up",
  },
  next: {
    eyebrow: "Your next best action", why: "Why this one", primary: "Continue my next application task", secondary: "Review applications with a counsellor",
    howTo: "How to do it", done: "Mark as done", doneNote: "Done. Here’s what’s next.", help: "Get help with this", modal: "Review your applications with a counsellor",
    plan: "Plan my move",
  },
  next_: "Continue",
  back: "Back",
  pins: "Your answers so far",
  edit: "Change",
  disclaimer: "Your tracker lives in this browser. Dates and statuses are what you entered; always check each university’s portal for the official position.",
};
