import { bucketCopy, intakes, POSTGRAD_FROM, scoreBands, uniPriorities } from "@/data/journey/config";
import { coursesByDiscipline } from "@/data/journey/courses";
import { destinationById } from "@/data/journey/destinations";
import { universities, universityById, type University } from "@/data/journey/universities";
import type { Bucket, DestinationId, PriorityId, UniPriorityId, UserProfile } from "./types";

/**
 * Shortlist evaluation: pure functions from the student's answers to
 * ambitious / target / safe universities with an indicative fit. Simple and
 * explainable on purpose — it orders options, it does not predict admission.
 * Swap it for a real recommendation service behind the same shapes.
 */

export type Evaluated = {
  uni: University;
  bucket: Bucket;
  /** 0–100, indicative. */
  fit: number;
  course: string;
  deadline: string;
  reason: string;
};

/** The student's academic level, 1–5, nudged by tests and experience. */
export function academicLevel(p: UserProfile) {
  let level = scoreBands.find((b) => b.id === p.academicScore)?.level ?? 3;
  if (p.tests.some((t) => t !== "none")) level += 0.25;
  if (p.qualification && POSTGRAD_FROM.includes(p.qualification) && (p.workExperience === "2-5" || p.workExperience === "5+")) level += 0.25;
  return level;
}

/** How strongly a university answers one priority, 1–5. */
function score(u: University, k: UniPriorityId) {
  switch (k) {
    case "reputation": return u.ratings.reputation;
    case "employability": return u.ratings.employability;
    case "courseQuality": return u.ratings.courseQuality;
    case "location": return u.ratings.location;
    case "studentLife": return u.ratings.studentLife;
    case "lowerTuition": return 6 - u.tuitionLevel;
    case "scholarships": return u.scholarship === "strong" ? 5 : u.scholarship === "some" ? 3 : 1;
    case "postStudyWork": return destinationById[u.country].weights.postStudyWork;
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Typical months between application deadline and start, per destination. Indicative. */
const LEAD: Record<DestinationId, number> = { uk: 6, usa: 8, canada: 7, australia: 4, europe: 6 };

/** "Usually around Mar 2027" — a typical window derived from the intake, never a real deadline. */
export function typicalDeadline(u: University, intakeId: string | null) {
  const it = intakes.find((o) => o.id === intakeId && o.id !== "undecided");
  if (!it) return "Depends on intake";
  const [y, m] = it.id.split("-").map(Number);
  const start = y * 12 + (m - 1) - LEAD[u.country];
  return `Usually around ${MONTHS[start % 12]} ${Math.floor(start / 12)}`;
}

const intakeMonth = (id: string | null) => (id?.endsWith("-01") ? "jan" : id?.endsWith("-09") ? "sep" : null);

export function evaluate(u: University, p: UserProfile): Evaluated {
  const gap = u.selectivity - academicLevel(p);
  // any university clearly above the student's level is a stretch; a full level below is safe
  const bucket: Bucket = gap >= 0.25 ? "ambitious" : gap <= -1 ? "safe" : "target";
  const keys = p.uniPriorities.length ? p.uniPriorities : (["courseQuality", "employability"] as UniPriorityId[]);
  const avg = keys.reduce((s, k) => s + score(u, k), 0) / keys.length;
  const chance = Math.min(0.95, Math.max(0.1, 0.55 - gap * 0.2));
  const fit = Math.round(Math.min(96, Math.max(35, 100 * (0.55 * ((avg - 1) / 4) + 0.45 * chance))));

  const strong = keys.filter((k) => score(u, k) >= 4).slice(0, 2).map((k) => uniPriorities.find((o) => o.id === k)!.short.toLowerCase());
  const lead = strong.length ? `Strong on ${strong.join(" and ")}` : `A solid all-round option in ${u.city}`;
  const discipline = p.discipline && p.discipline !== "undecided" ? p.discipline : null;
  const course = p.course ?? (discipline ? coursesByDiscipline[discipline][0] : "Course of your choice");

  return { uni: u, bucket, fit, course, deadline: typicalDeadline(u, p.intake), reason: `${lead}; ${bucketCopy[bucket].reason}.` };
}

/** Universities that match the answers at all: country, subject and intake. */
function candidates(p: UserProfile) {
  const places = p.openDestination || !p.destinations.length ? null : new Set(p.destinations);
  const discipline = p.discipline && p.discipline !== "undecided" ? p.discipline : null;
  const month = intakeMonth(p.intake);
  return universities.filter((u) =>
    (!places || places.has(u.country)) && (!discipline || u.disciplines.includes(discipline)) && (!month || u.intakes.includes(month)));
}

const ORDER: Bucket[] = ["ambitious", "target", "safe"];

/** A balanced recommendation: up to three per bucket, best fit first. */
export function recommend(p: UserProfile, perBucket = 3): string[] {
  const all = candidates(p).map((u) => evaluate(u, p)).sort((a, b) => b.fit - a.fit);
  const picked = ORDER.flatMap((b) => all.filter((e) => e.bucket === b).slice(0, perBucket));
  return picked.map((e) => e.uni.id);
}

/** The working shortlist, evaluated, in the student's order. */
export function evaluateList(ids: string[], p: UserProfile): Evaluated[] {
  return ids.map((id) => universityById[id]).filter(Boolean).map((u) => evaluate(u, p));
}

export const byBucket = (list: Evaluated[]) =>
  Object.fromEntries(ORDER.map((b) => [b, list.filter((e) => e.bucket === b)])) as Record<Bucket, Evaluated[]>;

/** Catalogue search for "add my universities": name or city. */
export function searchUniversities(q: string) {
  const t = q.trim().toLowerCase();
  if (!t) return universities;
  return universities.filter((u) => u.name.toLowerCase().includes(t) || u.city.toLowerCase().includes(t) || destinationById[u.country].label.toLowerCase().includes(t));
}

/** One line for the lead form's `context`. */
export function shortlistSummary(ids: string[]) {
  const names = ids.map((id) => universityById[id]?.name).filter(Boolean);
  return `Shortlist review: ${names.join(", ") || "no universities yet"}`.slice(0, 200);
}

/* ── Discovery (exploring) ─────────────────────────────────────────── */

/** Exploring asks "what matters to you"; shortlisting asks "what matters in a university". Same intent, mapped. */
const EXPLORE_TO_UNI: Record<PriorityId, UniPriorityId> = {
  reputation: "reputation", career: "employability", affordable: "lowerTuition", scholarships: "scholarships",
  postStudyWork: "postStudyWork", studentLife: "studentLife", fit: "courseQuality",
};

export type DiscoverGroup = "strong" | "worth" | "value";

/**
 * Universities worth exploring, before there's an academic profile: grouped
 * as strong match, worth exploring and value options rather than ambitious /
 * target / safe, which would need grades to mean anything.
 */
export function discover(p: UserProfile): { group: DiscoverGroup; e: Evaluated }[] {
  const asked: UserProfile = { ...p, uniPriorities: p.uniPriorities.length ? p.uniPriorities : p.priorities.map((x) => EXPLORE_TO_UNI[x]) };
  const places = p.destinations.length ? new Set(p.destinations) : null;
  const discipline = p.discipline && p.discipline !== "undecided" ? p.discipline : null;
  const pool = universities
    .filter((u) => (!places || places.has(u.country)) && (!discipline || u.disciplines.includes(discipline)))
    .map((u) => evaluate(u, asked))
    .sort((a, b) => b.fit - a.fit);
  const strong = pool.slice(0, 3);
  const rest = pool.slice(3);
  const value = rest.filter((e) => e.uni.tuitionLevel <= 2 || e.uni.scholarship === "strong").slice(0, 2);
  const worth = rest.filter((e) => !value.includes(e)).slice(0, 3);
  return [
    ...strong.map((e) => ({ group: "strong" as const, e })),
    ...worth.map((e) => ({ group: "worth" as const, e })),
    ...value.map((e) => ({ group: "value" as const, e })),
  ];
}
