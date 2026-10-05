import {
  appStatuses, appTasks, bucketCopy, DECIDE, disciplines, helpOptions, intakes, priorities, qualifications, scoreBands, tests, uniPriorities, type Option,
} from "@/data/journey/config";
import { careersByDiscipline, coursesByDiscipline } from "@/data/journey/courses";
import { destinations } from "@/data/journey/destinations";
import { universities, universityById, type University } from "@/data/journey/universities";
import { worldCopy as w } from "@/data/journey/worlds";
import { recommendDirections } from "./explore";
import { allDates, daysUntil, headline, submittedCount, uniShort, type NextAction } from "./applying";
import { funding, money, moveSummary, offerCity, offerCountry, selectedOffer, visaItems, visaProgress } from "./offer";
import type { Evaluated } from "./shortlist";
import type {
  ApplyStep, AppStatus, ArtSpec, Bucket, DestinationId, DisciplineId, ExploringStep, HelpId, LifecycleStage, MotionProfile, OfferStep, PriorityId, SceneItem,
  ShortlistStep, Stage, UniPriorityId, UserProfile,
} from "./types";

/**
 * What the inside of the head shows. A world is a backdrop plus a handful of
 * collage objects, positioned in percent of the head's opening (a strip about
 * twice as wide as it is tall). Pure functions: the home intro picks a world
 * from what is hovered or chosen, and `HeadWindow` animates between them.
 */

export type Backdrop =
  | { kind: "matte" }
  | { kind: "tint"; tone: "royal" | "coral" | "sky" }
  | { kind: "country"; destination: DestinationId }
  | { kind: "timeline" };

export type World = { key: string; backdrop: Backdrop; items: SceneItem[]; motion: MotionProfile };

const at = (x: number, y: number) => ({ x, y });
const thing = (id: string, art: ArtSpec, x: number, y: number, rotate = 0, extra: Partial<SceneItem> = {}): SceneItem =>
  ({ id, art, at: at(x, y), rotate, ...extra });

/* ── The four first-level states, previewed on hover ─────────────────── */

export function stageWorld(stage: Stage): World {
  switch (stage) {
    case "exploring":
      return {
        key: "overload", backdrop: { kind: "matte" }, motion: "drift",
        items: [
          thing("q0", { kind: "note", label: w.overload[0], tone: "ivory" }, 13, 30, -8),
          thing("q1", { kind: "note", label: w.overload[1], tone: "sky" }, 87, 28, 7),
          thing("q2", { kind: "note", label: w.overload[2], tone: "coral" }, 30, 76, 4, { scale: 0.85 }),
          thing("q3", { kind: "note", label: w.overload[3], tone: "ivory" }, 72, 76, -5, { scale: 0.85 }),
          thing("p-uk", { kind: "polaroid", destination: "uk" }, 35, 30, 6, { scale: 0.8 }),
          thing("p-australia", { kind: "polaroid", destination: "australia" }, 62, 26, -7, { scale: 0.8 }),
          thing("c-laptop", { kind: "chip", icon: "laptop" }, 6, 78),
          thing("c-steth", { kind: "chip", icon: "stethoscope" }, 94, 74),
          thing("c-chart", { kind: "chip", icon: "chart" }, 50, 56),
          thing("glyph", { kind: "glyph", label: "?" }, 49, 22, 10, { scale: 0.8 }),
          thing("s-sch", { kind: "sticker", label: w.scholarshipQ, tone: "coral" }, 86, 52, -6),
        ],
      };
    case "shortlisting":
      return {
        key: "shortlisting", backdrop: { kind: "tint", tone: "sky" }, motion: "snap",
        items: [
          thing("t0", { kind: "tab", label: w.shortlist.tabs[0] }, 17, 26, -4),
          thing("t1", { kind: "tab", label: w.shortlist.tabs[1] }, 83, 26, 4),
          thing("u-northbridge", { kind: "card", label: "Northbridge", sub: "Manchester", done: true }, 38, 46, -2),
          thing("u-lakeshore", { kind: "card", label: "Lakeshore", sub: "Toronto" }, 64, 52, 3),
          thing("u-coastal", { kind: "card", label: "Coastal Pacific", sub: "Sydney" }, 50, 80, 0),
          thing("fees", { kind: "sticker", label: w.shortlist.fees, tone: "coral" }, 15, 74, -5),
          thing("pin0", { kind: "chip", icon: "pin" }, 88, 56),
          thing("p-uk", { kind: "polaroid", destination: "uk", done: true }, 86, 82, 6, { scale: 0.75 }),
          thing("stamp", { kind: "stamp", label: w.shortlist.stamp, tone: "coral" }, 50, 18, -8),
        ],
      };
    case "applying":
      return {
        key: "applying", backdrop: { kind: "tint", tone: "coral" }, motion: "pipeline",
        items: [
          thing("portal", { kind: "tab", label: w.applying.portal }, 18, 24, -4),
          thing("mail", { kind: "tab", label: w.applying.mail }, 82, 22, 4),
          thing("d-sop", { kind: "doc", label: "SOP", done: true }, 34, 58, -5),
          thing("d-transcripts", { kind: "doc", label: "Transcript" }, 50, 52, 3),
          thing("d-lor", { kind: "doc", label: "LOR" }, 66, 60, -2),
          thing("dl", { kind: "calendar", label: "12", sub: w.applying.deadline, tone: "coral" }, 88, 62, 5, { pulse: true }),
          thing("check", { kind: "note", label: w.applying.checklist, tone: "ivory" }, 13, 70, -6, { scale: 0.85 }),
          thing("ready", { kind: "sticker", label: w.applying.ready, tone: "ivory" }, 50, 88, -2),
        ],
      };
    case "offer":
      return {
        key: "offer", backdrop: { kind: "tint", tone: "royal" }, motion: "settle",
        items: [
          thing("ticket", { kind: "ticket", label: "Boarding" }, 13, 40, -6),
          thing("letter", { kind: "letter", label: w.offer.letter }, 38, 50, -2, { focus: true }),
          thing("passport", { kind: "passport" }, 64, 46, 6),
          thing("visa", { kind: "stamp", label: w.offer.visa, tone: "coral" }, 69, 60, -14),
          thing("suitcase", { kind: "suitcase", done: true }, 86, 52, 4),
        ],
      };
  }
}

/* ── Exploring answers ───────────────────────────────────────────────── */

const TINT: Record<DisciplineId, "royal" | "coral" | "sky"> = {
  business: "royal", technology: "sky", engineering: "royal", law: "coral", medicine: "sky", design: "coral", undecided: "royal",
};

/** A course area: its icon at the centre, the courses it holds and where they lead around it. */
export function disciplineWorld(id: DisciplineId): World {
  if (id === "undecided") return { ...stageWorld("exploring"), key: "d-undecided" };
  const d = disciplines.find((x) => x.id === id)!;
  const [c0, c1, c2] = coursesByDiscipline[id];
  const [k0, k1] = careersByDiscipline[id];
  return {
    key: `d-${id}`, backdrop: { kind: "tint", tone: TINT[id] }, motion: "settle",
    items: [
      thing(`c-${id}`, { kind: "chip", icon: d.icon }, 50, 50, 0, { scale: 1.9, focus: true }),
      thing(`n0-${id}`, { kind: "note", label: c0, tone: "ivory" }, 15, 32, -6),
      thing(`n1-${id}`, { kind: "note", label: c1, tone: "sky" }, 85, 30, 6),
      thing(`n2-${id}`, { kind: "note", label: c2, tone: "ivory" }, 17, 74, 3, { scale: 0.9 }),
      thing(`k0-${id}`, { kind: "sticker", label: k0, tone: "coral" }, 80, 74, -4),
      thing(`k1-${id}`, { kind: "sticker", label: k1, tone: "royal" }, 38, 86, 3),
    ],
  };
}

/** A destination: its landscape fills the head, with a few lifestyle notes pinned on. */
export function destinationWorld(id: DestinationId | typeof DECIDE): World {
  if (id === DECIDE) {
    return {
      key: "decide", backdrop: { kind: "matte" }, motion: "snap",
      items: [
        ...destinations.map((d, i) => thing(`p-${d.id}`, { kind: "polaroid", destination: d.id }, 14 + i * 18, i % 2 ? 40 : 48, [-8, 5, -3, 7, -6][i], { scale: 0.85 })),
        thing("decide", { kind: "sticker", label: w.decide, tone: "ivory" }, 50, 86, -2),
      ],
    };
  }
  const d = destinations.find((x) => x.id === id)!;
  return {
    key: `p-${id}`, backdrop: { kind: "country", destination: id }, motion: "settle",
    items: [
      thing(`pol-${id}`, { kind: "polaroid", destination: id }, 16, 56, -6, { scale: 1.15, focus: true }),
      thing(`v0-${id}`, { kind: "sticker", label: d.vibes[0], tone: "ivory" }, 50, 24, -3),
      thing(`v1-${id}`, { kind: "sticker", label: d.vibes[1], tone: "coral" }, 80, 52, 4),
      thing(`v2-${id}`, { kind: "sticker", label: d.vibes[2], tone: "sky" }, 52, 82, -2),
    ],
  };
}

/** "Jan 2027" → JAN / 2027; "Not sure yet" → ? / Open. */
function calendarFace(o: Option) {
  if (o.id === "undecided") return { label: "?", sub: w.open };
  const [m, y] = o.label.split(" ");
  return { label: m.toUpperCase(), sub: y };
}

/** The year laid out as a timeline; the intake in focus steps forward with a plane over it. */
export function intakeWorld(focus: string | null): World {
  const i = intakes.findIndex((o) => o.id === focus);
  return {
    key: "timeline", backdrop: { kind: "timeline" }, motion: "snap",
    items: [
      ...intakes.map((o, n) => thing(`cal-${o.id}`, { kind: "calendar", ...calendarFace(o), tone: n === i ? "coral" : "ivory" }, 14 + n * 18, n === i ? 54 : 60, n === i ? 0 : n % 2 ? 4 : -4,
        { scale: n === i ? 1.3 : 0.9, focus: n === i, dim: i >= 0 && n !== i, still: true })),
      ...(i >= 0 ? [thing("plane", { kind: "chip", icon: "plane" }, 14 + i * 18, 24, 0, { still: true })] : []),
    ],
  };
}

/** Edge spots for priorities not (yet) picked; the middle row is kept for the ones that are. */
const EDGES = [at(13, 16), at(87, 16), at(9, 88), at(91, 88), at(33, 12), at(67, 12), at(50, 92), at(30, 90)];
const CENTRE = [at(22, 44), at(50, 40), at(78, 44)];
const TONES: ArtSpec["tone"][] = ["royal", "coral", "sky"];

/**
 * Priorities: unpicked ones hover small around the edges; each pick grows,
 * moves to the centre and brings its icon with it. A hovered option previews
 * in the next free centre spot.
 */
export function prioritiesWorld(picked: PriorityId[], preview: PriorityId | null): World {
  return pickedWorld(priorities, picked, preview, "priorities");
}

/** The same picking world over any list of options (exploring's or shortlisting's priorities). */
function pickedWorld<T extends string>(options: Option<T>[], picked: T[], preview: T | null, key: string): World {
  const shown = preview && !picked.includes(preview) && picked.length < CENTRE.length ? [...picked, preview] : picked;
  const items: SceneItem[] = [];
  let edge = 0;
  for (const o of options) {
    const n = shown.indexOf(o.id);
    if (n >= 0) {
      const isPreview = o.id === preview && !picked.includes(o.id);
      items.push(thing(`pr-${o.id}`, { kind: "sticker", label: o.short, tone: TONES[n] }, CENTRE[n].x, CENTRE[n].y, [-4, 2, 4][n], { scale: 1.35, focus: !isPreview, pulse: isPreview, still: true }));
      items.push(thing(`pi-${o.id}`, { kind: "chip", icon: o.icon }, CENTRE[n].x, 78, 0, { dim: isPreview, still: true }));
    } else {
      const p = EDGES[edge++ % EDGES.length];
      items.push(thing(`pr-${o.id}`, { kind: "sticker", label: o.short, tone: "ivory" }, p.x, p.y, edge % 2 ? 5 : -5, { scale: 0.8, dim: picked.length > 0 }));
    }
  }
  return { key, backdrop: { kind: "tint", tone: "royal" }, motion: "snap", items };
}

/** The destination the reveal centres on: the student's pick, or the best match for their priorities. */
export function revealDestination(p: UserProfile) {
  const chosen = p.destinations[0];
  return { id: chosen ?? recommendDirections(p)[0].destination.id, suggested: !chosen };
}

/** Everything resolved into one calm world, set in the chosen (or suggested) place. */
export function resultWorld(p: UserProfile): World {
  const place = revealDestination(p).id;
  const d = disciplines.find((x) => x.id === p.discipline);
  const intake = intakes.find((o) => o.id === p.intake);
  const items: SceneItem[] = [
    thing("r-place", { kind: "polaroid", destination: place }, 15, 52, -4, { scale: 1.2, focus: true, still: true }),
  ];
  if (d) items.push(thing("r-course", { kind: "chip", icon: d.icon }, 40, 30, 0, { scale: 1.3, still: true }));
  if (intake) items.push(thing("r-intake", { kind: "calendar", ...calendarFace(intake), tone: "coral" }, 40, 72, 3, { still: true }));
  p.priorities.forEach((id, n) => {
    const o = priorities.find((x) => x.id === id)!;
    items.push(thing(`r-pr-${id}`, { kind: "sticker", label: o.short, tone: TONES[n] }, 72, 24 + n * 26, [-3, 2, -2][n], { still: true }));
  });
  return { key: "result", backdrop: { kind: "country", destination: place }, motion: "settle", items };
}

/** What is being hovered or focused, so the thought panel can preview it before it is chosen. */
export type Preview =
  | { kind: "discipline"; id: DisciplineId }
  | { kind: "course"; id: string; discipline: DisciplineId }
  | { kind: "destination"; id: DestinationId | typeof DECIDE }
  | { kind: "intake"; id: string }
  | { kind: "priority"; id: PriorityId }
  | { kind: "uniPriority"; id: UniPriorityId }
  | { kind: "mode"; id: "own" | "recommend" }
  | { kind: "university"; id: string }
  | { kind: "appStatus"; id: AppStatus; university: string }
  | { kind: "help"; id: HelpId };

/**
 * The world for an exploring step: a hovered option previews; otherwise the
 * current answer holds; before any answer, the possibility overload.
 */
export function exploringWorld(step: ExploringStep, preview: Preview | null, p: UserProfile): World {
  switch (step) {
    case "course": {
      const id = preview?.kind === "discipline" ? preview.id : p.discipline;
      return id ? disciplineWorld(id) : stageWorld("exploring");
    }
    case "destination": {
      const id = preview?.kind === "destination" ? preview.id : p.destinations[0] ?? (p.openDestination ? DECIDE : null);
      if (id) return destinationWorld(id);
      return p.discipline ? disciplineWorld(p.discipline) : stageWorld("exploring");
    }
    case "intake": return intakeWorld(preview?.kind === "intake" ? preview.id : p.intake);
    case "priorities": return prioritiesWorld(p.priorities, preview?.kind === "priority" ? preview.id : null);
    case "result": return resultWorld(p);
  }
}

/* ── Shortlisting: too many options → filter → compare → rank → commit ── */

/** "Northbridge University" → "Northbridge", so cards stay legible inside the head. */
export const shortName = (u: University) =>
  u.name.replace(/ (University|Institute of Technology|School of Management|Technical University)$/, "");

const uniCard = (u: University, x: number, y: number, extra: Partial<SceneItem> = {}, done = false) =>
  thing(`u-${u.id}`, { kind: "card", label: shortName(u), sub: u.city, done }, x, y, extra.rotate ?? 0, extra);

/** Every university at once, scattered: the overwhelm a shortlist starts from. */
function overwhelm(key = "too-many"): World {
  const spots = [at(16, 22), at(50, 16), at(84, 24), at(28, 50), at(70, 46), at(14, 80), at(46, 80), at(84, 78)];
  return {
    key, backdrop: { kind: "tint", tone: "sky" }, motion: "drift",
    items: [
      ...universities.slice(0, spots.length).map((u, i) => uniCard(u, spots[i].x, spots[i].y, { rotate: i % 2 ? 5 : -5, scale: 0.9 })),
      thing("glyph", { kind: "glyph", label: "?" }, 52, 50, 8, { scale: 0.7 }),
    ],
  };
}

/** A course area or exact course, with universities that teach it. */
function courseWorld(discipline: DisciplineId, course: string | null): World {
  const d = disciplines.find((x) => x.id === discipline)!;
  const teach = universities.filter((u) => discipline === "undecided" || u.disciplines.includes(discipline)).slice(0, 3);
  return {
    key: `sc-${discipline}`, backdrop: { kind: "tint", tone: "royal" }, motion: "settle",
    items: [
      thing(`c-${discipline}`, { kind: "chip", icon: d.icon }, 50, 46, 0, { scale: 1.7, focus: true }),
      ...(course ? [thing(`course-${course}`, { kind: "note", label: course, tone: "ivory" }, 19, 34, -5, { focus: true })] : []),
      ...teach.map((u, i) => uniCard(u, [80, 76, 24][i], [26, 74, 76][i], { rotate: [4, -3, 3][i] })),
    ],
  };
}

/** Chosen countries pinned side by side, each with how many universities it adds. */
function countriesWorld(p: UserProfile, preview: DestinationId | typeof DECIDE | null): World {
  if (preview) return destinationWorld(preview);
  if (p.openDestination) return destinationWorld(DECIDE);
  if (!p.destinations.length) return overwhelm();
  const n = p.destinations.length;
  return {
    key: "countries", backdrop: { kind: "tint", tone: "sky" }, motion: "snap",
    items: p.destinations.flatMap((id, i) => {
      const x = n === 1 ? 50 : 14 + (i * 72) / (n - 1);
      const count = universities.filter((u) => u.country === id).length;
      return [
        thing(`p-${id}`, { kind: "polaroid", destination: id }, x, 44, i % 2 ? 4 : -4, { scale: 0.95, still: true }),
        thing(`n-${id}`, { kind: "sticker", label: `${count} universities`, tone: "ivory" }, x, 84, 0, { scale: 0.8, still: true }),
      ];
    }),
  };
}

/** Academic fit as a desk: transcript, score, tests, experience. */
function fitWorld(p: UserProfile): World {
  const q = qualifications.find((o) => o.id === p.qualification);
  const sb = scoreBands.find((o) => o.id === p.academicScore);
  const taken = tests.filter((t) => p.tests.includes(t.id) && t.id !== "none");
  return {
    key: "fit", backdrop: { kind: "tint", tone: "coral" }, motion: "settle",
    items: [
      thing("transcript", { kind: "doc", label: "Transcript" }, 22, 50, -4, { scale: 1.3, focus: !!sb }),
      ...(q ? [thing(`q-${q.id}`, { kind: "note", label: q.label, tone: "sky" }, 48, 30, 3)] : []),
      ...(sb ? [thing(`s-${sb.id}`, { kind: "stamp", label: sb.short, tone: "coral" }, 30, 72, -10, { scale: 1.2 })] : []),
      ...taken.map((t, i) => thing(`t-${t.id}`, { kind: "sticker", label: t.short, tone: "ivory" }, 72 + (i % 2) * 14, 28 + Math.floor(i / 2) * 22, i % 2 ? 4 : -4)),
      ...(p.workExperience && p.workExperience !== "none" ? [thing("work", { kind: "chip", icon: "briefcase" }, 56, 76)] : []),
    ],
  };
}

/** Bringing your own list, or letting us suggest one. */
function existingWorld(p: UserProfile, mode: "own" | "recommend" | null): World {
  const m = mode ?? p.shortlistMode;
  if (m === "own") {
    const own = p.ownUniversities.map((id) => universityById[id]).filter(Boolean);
    return {
      key: "own", backdrop: { kind: "tint", tone: "sky" }, motion: "snap",
      items: [
        thing("search", { kind: "tab", label: "Search universities" }, 20, 22, -3),
        ...own.slice(0, 6).map((u, i) => uniCard(u, 22 + (i % 3) * 28, 50 + Math.floor(i / 3) * 30, { still: true }, true)),
      ],
    };
  }
  if (m === "recommend") {
    return {
      key: "recommend", backdrop: { kind: "tint", tone: "royal" }, motion: "drift",
      items: [
        thing("spark", { kind: "chip", icon: "sparkles" }, 50, 50, 0, { scale: 1.6, focus: true }),
        ...universities.slice(0, 6).map((u, i) => uniCard(u, [16, 84, 18, 82, 34, 66][i], [24, 24, 76, 76, 14, 86][i], { rotate: i % 2 ? 5 : -5, scale: 0.85, dim: true })),
      ],
    };
  }
  return overwhelm("existing");
}

const COLS: Record<Bucket, number> = { ambitious: 18, target: 50, safe: 82 };
const BUCKET_TONE: Record<Bucket, ArtSpec["tone"]> = { ambitious: "coral", target: "royal", safe: "sky" };
const BUCKETS = Object.keys(COLS) as Bucket[];

/** The reveal: every university snaps into its column. */
function bucketsWorld(list: Evaluated[], focusId: string | null): World {
  const items: SceneItem[] = BUCKETS.map((b) =>
    thing(`b-${b}`, { kind: "stamp", label: bucketCopy[b].label, tone: BUCKET_TONE[b] }, COLS[b], 14, -4, { still: true }));
  for (const b of BUCKETS) {
    list.filter((e) => e.bucket === b).slice(0, 3).forEach((e, i) => {
      items.push(uniCard(e.uni, COLS[b], 38 + i * 24, { still: true, scale: 0.85, focus: e.uni.id === focusId, dim: !!focusId && e.uni.id !== focusId }, i === 0));
    });
  }
  return { key: "buckets", backdrop: { kind: "tint", tone: "sky" }, motion: "snap", items };
}

/** Compare: the chosen few side by side, everything else gone. */
function compareWorld(ids: string[], list: Evaluated[]): World {
  const picked = ids.map((id) => universityById[id]).filter(Boolean);
  if (picked.length < 2) return bucketsWorld(list, picked[0]?.id ?? null);
  const n = picked.length;
  return {
    key: "compare", backdrop: { kind: "tint", tone: "royal" }, motion: "snap",
    items: [
      ...picked.map((u, i) => uniCard(u, 14 + (i * 72) / (n - 1), 46, { still: true, focus: true })),
      ...picked.slice(1).map((_, i) => thing(`vs-${i}`, { kind: "glyph", label: "vs" }, 14 + ((i + 0.5) * 72) / (n - 1), 80, 0, { scale: 0.45, still: true })),
    ],
  };
}

/** Finalise: the ranked list, saved ones ticked, folded into "My shortlist". */
function finaliseWorld(p: UserProfile): World {
  const top = p.shortlist.map((id) => universityById[id]).filter(Boolean).slice(0, 4);
  return {
    key: "finalise", backdrop: { kind: "tint", tone: "royal" }, motion: "settle",
    items: [
      ...top.flatMap((u, i) => [
        thing(`rank-${i}`, { kind: "stamp", label: String(i + 1), tone: "coral" }, 12 + i * 21, 22, -6, { still: true }),
        uniCard(u, 18 + i * 21, 50, { still: true, rotate: i % 2 ? 2 : -2 }, p.savedUniversities.includes(u.id)),
      ]),
      thing("folder", { kind: "note", label: "My shortlist", sub: `${p.shortlist.length} universities`, tone: "sky" }, 50, 84, -2, { focus: true, still: true }),
    ],
  };
}

/**
 * The world for a shortlisting step: hovered options preview, chosen answers
 * hold, and the later steps show the shortlist itself narrowing to a decision.
 */
export function shortlistWorld(step: ShortlistStep, preview: Preview | null, p: UserProfile, list: Evaluated[], compareIds: string[]): World {
  switch (step) {
    case "course": {
      if (preview?.kind === "course") return courseWorld(preview.discipline, preview.id);
      if (preview?.kind === "discipline") return courseWorld(preview.id, null);
      return p.discipline ? courseWorld(p.discipline, p.course) : overwhelm();
    }
    case "countries": return countriesWorld(p, preview?.kind === "destination" ? preview.id : null);
    case "intake": return intakeWorld(preview?.kind === "intake" ? preview.id : p.intake);
    case "fit": return fitWorld(p);
    case "priorities": return pickedWorld(uniPriorities, p.uniPriorities, preview?.kind === "uniPriority" ? preview.id : null, "uni-priorities");
    case "existing": return existingWorld(p, preview?.kind === "mode" ? preview.id : null);
    case "reveal": return bucketsWorld(list, preview?.kind === "university" ? preview.id : null);
    case "compare": return compareWorld(compareIds, list);
    case "finalise": return finaliseWorld(p);
  }
}

/* ── Applying: scattered applications → organised tracker → deadlines → one next action ── */

const STATUS_TONE: Record<AppStatus, ArtSpec["tone"]> = {
  notStarted: "ivory", inProgress: "sky", submitted: "royal", interview: "coral", docsRequested: "coral", awaiting: "royal", decision: "ivory", rejected: "ink",
};
const spread = (n: number, i: number, from = 14, to = 86) => (n === 1 ? 50 : from + (i * (to - from)) / (n - 1));
const appCard = (id: string, x: number, y: number, extra: Partial<SceneItem> = {}, done = false) =>
  thing(`a-${id}`, { kind: "card", label: uniShort(id), sub: "Application", done }, x, y, extra.rotate ?? 0, extra);

/** The applications the student has named, lined up: scatter becoming a row. */
function applicationsRow(p: UserProfile): World {
  if (!p.applications.length) return stageWorld("applying");
  const apps = p.applications.slice(0, 5);
  return {
    key: "apps", backdrop: { kind: "tint", tone: "coral" }, motion: "snap",
    items: [
      ...apps.map((a, i) => appCard(a.university, spread(apps.length, i), 48, { still: true, rotate: i % 2 ? 2 : -2 })),
      thing("portal", { kind: "tab", label: w.applying.portal }, 20, 16, -3, { dim: true }),
    ],
  };
}

/** The tracker: every application with its status stamped beneath. */
function statusWorld(p: UserProfile, preview: { id: AppStatus; university: string } | null): World {
  const apps = p.applications.slice(0, 5);
  return {
    key: "tracker", backdrop: { kind: "tint", tone: "sky" }, motion: "snap",
    items: apps.flatMap((a, i) => {
      const x = spread(apps.length, i);
      const st = preview && preview.university === a.university ? preview.id : a.status;
      const label = appStatuses.find((s) => s.id === st)!.short;
      return [
        appCard(a.university, x, 32, { still: true }),
        thing(`s-${a.university}`, { kind: "stamp", label, tone: STATUS_TONE[st] }, x, 74, -6, { still: true, pulse: !!preview && preview.university === a.university }),
      ];
    }),
  };
}

/** What's pending, per application: a pile of documents still to do under each one. */
function pendingWorld(p: UserProfile, focus: string | null): World {
  const apps = p.applications.slice(0, 4);
  return {
    key: "pending", backdrop: { kind: "tint", tone: "coral" }, motion: "pipeline",
    items: apps.flatMap((a, i) => {
      const x = spread(apps.length, i, 16, 84);
      const dim = !!focus && focus !== a.university;
      const docs = a.pending.slice(0, 3).map((t, j) =>
        thing(`p-${a.university}-${t}`, { kind: "doc", label: appTasks.find((x2) => x2.id === t)!.short }, x + (j - 1) * 4, 62 + j * 6, (j - 1) * 5, { still: true, pulse: !dim, dim, scale: 0.85 }));
      return [
        appCard(a.university, x, 20, { still: true, dim }, !a.pending.length),
        ...(a.pending.length ? docs : [thing(`ok-${a.university}`, { kind: "sticker", label: "✓ Complete", tone: "sky" }, x, 66, -3, { still: true, dim })]),
      ];
    }),
  };
}

/** Deadlines become clear: every date on one line, soonest first and loudest. */
function deadlinesWorld(p: UserProfile, today: string): World {
  const dated = allDates(p.applications, today).slice(0, 5);
  if (!dated.length) {
    return { key: "deadlines", backdrop: { kind: "timeline" }, motion: "snap", items: [thing("cal-empty", { kind: "calendar", label: "?", sub: "Add dates" }, 50, 56, 0, { scale: 1.3 })] };
  }
  return {
    key: "deadlines", backdrop: { kind: "timeline" }, motion: "snap",
    items: dated.flatMap((d, i) => {
      const x = spread(dated.length, i);
      const first = i === 0;
      return [
        thing(`cal-${d.university}-${d.kind}`, { kind: "calendar", label: String(Math.max(d.days, 0)), sub: d.days < 0 ? "passed" : "days left", tone: first ? "coral" : "ivory" }, x, first ? 54 : 60, first ? 0 : i % 2 ? 4 : -4,
          { scale: first ? 1.35 : 0.9, focus: first, pulse: first, still: true }),
        thing(`lab-${d.university}-${d.kind}`, { kind: "sticker", label: `${uniShort(d.university)} · ${d.kind}`, tone: first ? "coral" : "ivory" }, x, first ? 16 : 20, 0, { scale: 0.7, still: true }),
      ];
    }),
  };
}

/** Help wanted: the chosen kinds of help pinned up, waiting for a counsellor. */
function helpWorld(p: UserProfile, preview: HelpId | null): World {
  const ids = preview && !p.helpNeeded.includes(preview) ? [...p.helpNeeded, preview] : p.helpNeeded;
  const shown = helpOptions.filter((o) => ids.includes(o.id) && o.id !== "none");
  if (!shown.length) return applicationsRow(p);
  return {
    key: "help", backdrop: { kind: "tint", tone: "royal" }, motion: "settle",
    items: shown.flatMap((o, i) => [
      thing(`h-${o.id}`, { kind: "sticker", label: o.short, tone: i % 2 ? "coral" : "sky" }, spread(shown.length, i, 18, 82), 40, i % 2 ? 3 : -3, { still: true, pulse: o.id === preview }),
      thing(`hi-${o.id}`, { kind: "chip", icon: o.icon }, spread(shown.length, i, 18, 82), 74, 0, { still: true }),
    ]),
  };
}

/** The dashboard: one row per application with its status line, plus overall progress. */
function dashboardWorld(p: UserProfile, today: string): World {
  const apps = p.applications.slice(0, 4);
  return {
    key: "dashboard", backdrop: { kind: "tint", tone: "sky" }, motion: "settle",
    items: [
      ...apps.flatMap((a, i) => {
        const h = headline(a, today);
        const y = apps.length === 1 ? 46 : 16 + (i * 64) / (apps.length - 1);
        return [
          appCard(a.university, 24, y, { still: true, scale: 0.85 }, h.tone === "royal" || h.tone === "ivory"),
          thing(`hl-${a.university}`, { kind: "sticker", label: h.text, tone: h.urgent ? "coral" : "ivory" }, 62, y, 0, { still: true, pulse: h.urgent, scale: 0.85 }),
        ];
      }),
      thing("progress", { kind: "stamp", label: `${submittedCount(p.applications)}/${p.applications.length} in`, tone: "coral" }, 90, 84, -8, { still: true }),
    ],
  };
}

/** One next action: everything else clears and a single note stays. */
function nextWorld(action: NextAction | null): World {
  if (!action) return stageWorld("applying");
  return {
    key: "next", backdrop: { kind: "tint", tone: "coral" }, motion: "settle",
    items: [
      thing(`next-${action.label}`, { kind: "note", label: action.label, tone: "ivory" }, 44, 50, -2, { scale: 1.35, focus: true, still: true }),
      ...(action.days !== null ? [thing("next-days", { kind: "calendar", label: String(Math.max(action.days, 0)), sub: "days left", tone: "coral" }, 82, 48, 5, { still: true, pulse: action.days <= 14 })] : []),
    ],
  };
}

/** The world for an applying step. */
export function applyWorld(step: ApplyStep, preview: Preview | null, p: UserProfile, today: string, action: NextAction | null): World {
  switch (step) {
    case "universities": return applicationsRow(p);
    case "status": return statusWorld(p, preview?.kind === "appStatus" ? preview : null);
    case "pending": return pendingWorld(p, preview?.kind === "university" ? preview.id : null);
    case "deadlines": return deadlinesWorld(p, today);
    case "help": return helpWorld(p, preview?.kind === "help" ? preview.id : null);
    case "dashboard": return dashboardWorld(p, today);
    case "next": return nextWorld(action);
  }
}

/* ── Offer & departure: celebration → planning → focused checklist ── */

const letter = (id: string, label: string, x: number, y: number, extra: Partial<SceneItem> = {}) =>
  thing(`l-${id}`, { kind: "letter", label }, x, y, extra.rotate ?? 0, extra);

/** The world for an offer/departure step. */
export function offerWorld(step: OfferStep, p: UserProfile, today: string): World {
  const sel = selectedOffer(p);
  const country = sel ? offerCountry(sel) : null;
  switch (step) {
    case "situation":
    case "offers": {
      if (!p.offers.length) return stageWorld("offer");
      const n = Math.min(p.offers.length, 3);
      return {
        key: "offers", backdrop: { kind: "tint", tone: "royal" }, motion: "settle",
        items: [
          ...p.offers.slice(0, 3).map((o, i) => letter(o.id, uniShort(o.university), spread(n, i, 22, 78), 50, { rotate: i % 2 ? 4 : -4, scale: 0.85 })),
          thing("confetti", { kind: "glyph", label: "✦" }, 92, 8, 0, { scale: 0.6, overflow: true }),
        ],
      };
    }
    case "acceptance": {
      const n = Math.min(p.offers.length, 3);
      return {
        key: "acceptance", backdrop: { kind: "tint", tone: "royal" }, motion: "snap",
        items: p.offers.slice(0, 3).flatMap((o, i) => {
          const x = spread(n, i, 22, 78);
          const chosen = sel?.id === o.id;
          return [
            letter(o.id, uniShort(o.university), x, 46, { focus: chosen, dim: !!sel && !chosen, still: true, scale: chosen ? 1 : 0.8 }),
            ...(chosen && o.accepted ? [thing(`acc-${o.id}`, { kind: "stamp", label: "Accepted", tone: "coral" }, x + 8, 74, -12, { still: true })] : []),
          ];
        }),
      };
    }
    case "conditions": {
      const conds = sel?.conditions ?? [];
      return {
        key: "conditions", backdrop: { kind: "tint", tone: "coral" }, motion: "pipeline",
        items: [
          letter("c", sel ? uniShort(sel.university) : "Offer", 20, 48, { still: true, scale: 0.85 }),
          ...conds.slice(0, 4).map((c, i) => thing(`cond-${c.id}`, { kind: "doc", label: c.label, done: c.complete }, 46 + i * 14, i % 2 ? 40 : 56, i % 2 ? 4 : -4, { still: true, pulse: !c.complete, scale: 0.85 })),
        ],
      };
    }
    case "visa": {
      const items = visaItems(p);
      return {
        key: "visa", backdrop: { kind: "tint", tone: "sky" }, motion: "pipeline",
        items: [
          thing("passport", { kind: "passport" }, 14, 50, -8, { scale: 1.3, focus: true, still: true }),
          ...items.slice(0, 5).map((v, i) => thing(`v-${v.id}`, { kind: "doc", label: v.title, done: p.departure.visa[v.id] === "done" }, 34 + i * 14, i % 2 ? 40 : 58, i % 2 ? 3 : -3,
            { still: true, pulse: p.departure.visa[v.id] === "inProgress", dim: p.departure.visa[v.id] === undefined, scale: 0.8 })),
          ...(visaProgress(p) === 100 ? [thing("visa-ok", { kind: "stamp", label: "Visa", tone: "coral" }, 20, 76, -14, { still: true })] : []),
        ],
      };
    }
    case "funding": {
      const f = funding(p);
      return {
        key: "funding", backdrop: { kind: "tint", tone: "coral" }, motion: "settle",
        items: [
          thing("wallet", { kind: "chip", icon: "wallet" }, 50, 46, 0, { scale: 1.7, focus: true, still: true }),
          thing("f-tuition", { kind: "sticker", label: `Tuition ${money(f.tuition, f.country)}`, tone: "ivory" }, 20, 26, -4, { still: true }),
          thing("f-sch", { kind: "sticker", label: `Scholarship ${money(f.scholarship, f.country)}`, tone: "sky" }, 80, 26, 4, { still: true }),
          thing("f-gap", { kind: "sticker", label: f.gap > 0 ? `Gap ${money(f.gap, f.country)}` : "Covered ✓", tone: f.gap > 0 ? "coral" : "royal" }, 50, 84, 0, { still: true, pulse: f.gap > 0 }),
        ],
      };
    }
    case "accommodation": {
      return {
        key: "accommodation", backdrop: country ? { kind: "country", destination: country } : { kind: "tint", tone: "sky" }, motion: "settle",
        items: [
          thing("home", { kind: "note", label: sel ? offerCity(sel) : "New home", tone: "ivory" }, 26, 44, -4, { still: true, focus: true }),
          thing("acc-status", { kind: "stamp", label: p.departure.accommodation.status === "booked" ? "Booked" : "Searching", tone: "coral" }, 72, 60, -10, { still: true }),
        ],
      };
    }
    case "travel": {
      const days = p.departure.departureDate ? daysUntil(p.departure.departureDate, today) : null;
      return {
        key: "travel", backdrop: { kind: "timeline" }, motion: "pipeline",
        items: [
          thing("ticket", { kind: "ticket", label: "Boarding" }, 22, 46, -4, { still: true, focus: true }),
          thing("suitcase", { kind: "suitcase", done: p.departure.travel.includes("packing") }, 50, 56, 4, { still: true }),
          ...(days !== null ? [thing("countdown", { kind: "calendar", label: String(Math.max(0, days)), sub: "days to go", tone: "coral" }, 78, 50, 4, { still: true, pulse: days <= 14 })] : []),
          thing("plane", { kind: "chip", icon: "plane" }, 90, 4, 0, { overflow: true, still: true }),
        ],
      };
    }
    case "move": {
      const done = moveSummary(p).filter((r) => r.done).length;
      if (!sel) return stageWorld("offer");
      return {
        key: done === 5 ? "ready" : "move", backdrop: country ? { kind: "country", destination: country } : { kind: "tint", tone: "royal" }, motion: "settle",
        items: [
          ...(country ? [thing("dest", { kind: "polaroid", destination: country }, 18, 52, -6, { scale: 1.2, focus: true, still: true })] : []),
          thing("progress", { kind: "stamp", label: `${done}/5 ready`, tone: "coral" }, 76, 30, -8, { still: true }),
          thing("plane", { kind: "chip", icon: "plane" }, 70, 70, 0, { still: true }),
        ],
      };
    }
  }
}

/** The head on the personalised home: the world of wherever the student is. */
export function homeWorld(stage: LifecycleStage, p: UserProfile, today: string, list: Evaluated[]): World {
  switch (stage) {
    case "anonymous": return stageWorld("exploring");
    case "exploring": return p.priorities.length ? resultWorld(p) : stageWorld("exploring");
    case "shortlisting": return list.length ? bucketsWorld(list, null) : stageWorld("shortlisting");
    case "applying":
    case "waiting": return applyWorld("dashboard", null, p, today, null);
    case "offer":
    case "departure":
    case "arrival": return offerWorld("move", p, today);
  }
}
