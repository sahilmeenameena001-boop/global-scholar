import { DECIDE, disciplines, intakes, priorities, type Option } from "@/data/journey/config";
import { careersByDiscipline, coursesByDiscipline } from "@/data/journey/courses";
import { destinations } from "@/data/journey/destinations";
import { applicationDocuments } from "@/data/journey/requirements";
import { worldCopy as w } from "@/data/journey/worlds";
import { recommendDirections } from "./explore";
import type { ArtSpec, DestinationId, DisciplineId, MotionProfile, PriorityId, SceneItem, Stage, UserProfile } from "./types";

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
          thing("t0", { kind: "tab", label: w.shortlist.tabs[0] }, 18, 28, -4),
          thing("t1", { kind: "tab", label: w.shortlist.tabs[1] }, 82, 30, 4),
          thing("u0", { kind: "card", label: "Northbridge", sub: "UK", done: true }, 36, 68, -2),
          thing("u1", { kind: "card", label: "Lakeshore Tech", sub: "Canada" }, 64, 66, 3),
          thing("u2", { kind: "card", label: "Redwood State", sub: "USA" }, 50, 30, 0),
          thing("stamp", { kind: "stamp", label: w.shortlist.stamp, tone: "coral" }, 88, 76, -8),
          thing("star", { kind: "chip", icon: "star" }, 10, 72),
        ],
      };
    case "applying":
      return {
        key: "applying", backdrop: { kind: "tint", tone: "coral" }, motion: "pipeline",
        items: [
          ...applicationDocuments.slice(0, 4).map((d, i) =>
            thing(`d-${d.id}`, { kind: "doc", label: d.label, done: i < 2 }, 14 + i * 17, i % 2 ? 40 : 48, i % 2 ? 4 : -4)),
          thing("dl", { kind: "calendar", label: "18", sub: w.applying.deadline, tone: "coral" }, 86, 42, 5, { pulse: true }),
          thing("ready", { kind: "sticker", label: w.applying.ready, tone: "ivory" }, 50, 86, -2),
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
const EDGES = [at(13, 16), at(87, 16), at(9, 88), at(91, 88), at(33, 12), at(67, 12), at(50, 92)];
const CENTRE = [at(22, 44), at(50, 40), at(78, 44)];
const TONES: ArtSpec["tone"][] = ["royal", "coral", "sky"];

/**
 * Priorities: unpicked ones hover small around the edges; each pick grows,
 * moves to the centre and brings its icon with it. A hovered option previews
 * in the next free centre spot.
 */
export function prioritiesWorld(picked: PriorityId[], preview: PriorityId | null): World {
  const shown = preview && !picked.includes(preview) && picked.length < CENTRE.length ? [...picked, preview] : picked;
  const items: SceneItem[] = [];
  let edge = 0;
  for (const o of priorities) {
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
  return { key: "priorities", backdrop: { kind: "tint", tone: "royal" }, motion: "snap", items };
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
