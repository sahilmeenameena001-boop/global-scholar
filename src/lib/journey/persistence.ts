import {
  APP_STATUSES, APP_TASKS, DEADLINE_KINDS, emptyDeparture, emptyProfile, HELP_IDS, isStage, OFFER_SITUATIONS, PRIORITY_IDS, STAGES, UNI_PRIORITY_IDS,
  type Application, type DeadlineKind, type Departure, type DestinationId, type HelpId, type JourneyState, type Offer, type PriorityId,
  type UniPriorityId, type UserProfile,
} from "./types";

/**
 * Where the journey is saved. The store only ever talks to this interface, so
 * moving from localStorage to Supabase, Firebase or an API means writing one
 * adapter and passing it to `configureJourneyPersistence` — no component
 * changes. `load` may be async; the store renders the empty state until it
 * resolves.
 */
export interface JourneyPersistence {
  load(): JourneyState | null | Promise<JourneyState | null>;
  save(state: JourneyState): void | Promise<void>;
  clear(): void | Promise<void>;
}

export const initialJourney: JourneyState = { version: 1, profile: emptyProfile, steps: {}, updatedAt: null };

const KEY = "gs:journey:v1";

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const str = (v: unknown) => (typeof v === "string" ? v : null);
const oneOf = <T extends string>(list: readonly T[]) => (v: unknown): v is T => typeof v === "string" && (list as readonly string[]).includes(v);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : undefined);
const obj = (v: unknown) => (typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {});
const DESTS: DestinationId[] = ["uk", "usa", "canada", "australia", "europe"];

function offers(v: unknown): Offer[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((x) => {
    const o = obj(x);
    if (typeof o.id !== "string" || typeof o.university !== "string") return [];
    return [{
      id: o.id,
      university: o.university,
      country: oneOf(DESTS)(o.country) ? o.country : null,
      type: o.type === "conditional" ? "conditional" : "unconditional",
      tuition: num(o.tuition), scholarshipAmount: num(o.scholarshipAmount), depositAmount: num(o.depositAmount),
      depositDeadline: typeof o.depositDeadline === "string" && ISO_DATE.test(o.depositDeadline) ? o.depositDeadline : undefined,
      depositPaid: o.depositPaid === true,
      conditions: (Array.isArray(o.conditions) ? o.conditions : []).flatMap((c) => {
        const cc = obj(c);
        return typeof cc.id === "string" && typeof cc.label === "string" ? [{ id: cc.id, label: cc.label, complete: cc.complete === true }] : [];
      }),
      accepted: o.accepted === true,
    }];
  });
}

function departure(v: unknown): Departure {
  const d = obj(v);
  const visa: Departure["visa"] = {};
  for (const [k, s] of Object.entries(obj(d.visa))) if (s === "notStarted" || s === "inProgress" || s === "done") visa[k] = s;
  const f = obj(d.funding);
  const a = obj(d.accommodation);
  return {
    visa,
    funding: { tuition: num(f.tuition), scholarship: num(f.scholarship), paid: num(f.paid), livingCost: num(f.livingCost), family: num(f.family), loan: num(f.loan) },
    accommodation: { ...emptyDeparture.accommodation, preference: str(a.preference), budget: num(a.budget), commute: str(a.commute), sharing: str(a.sharing), status: str(a.status) },
    travel: strings(d.travel),
    departureDate: typeof d.departureDate === "string" && ISO_DATE.test(d.departureDate) ? d.departureDate : null,
  };
}

/** Applications come back from storage untrusted: keep only well-formed records and fields. */
function applications(v: unknown): Application[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((a) => {
    if (typeof a !== "object" || a === null) return [];
    const o = a as Record<string, unknown>;
    if (typeof o.university !== "string" || !o.university) return [];
    const d = (typeof o.dates === "object" && o.dates !== null ? o.dates : {}) as Record<string, unknown>;
    const dates: Application["dates"] = {};
    for (const k of DEADLINE_KINDS) if (typeof d[k] === "string" && ISO_DATE.test(d[k] as string)) dates[k as DeadlineKind] = d[k] as string;
    return [{
      university: o.university,
      status: oneOf(APP_STATUSES)(o.status) ? o.status : "notStarted",
      pending: strings(o.pending).filter(oneOf(APP_TASKS)),
      dates,
    }];
  });
}

/**
 * Narrows whatever came back from storage to a valid state. Storage is user
 * controlled, so anything malformed falls back to the empty value for that
 * field rather than throwing during render.
 */
export function coerceJourney(input: unknown): JourneyState | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  if (o.version !== 1) return null;
  const p = (typeof o.profile === "object" && o.profile !== null ? o.profile : {}) as Record<string, unknown>;
  const s = (typeof o.steps === "object" && o.steps !== null ? o.steps : {}) as Record<string, unknown>;

  const profile: UserProfile = {
    ...emptyProfile,
    journeyStage: isStage(p.journeyStage) ? p.journeyStage : null,
    discipline: str(p.discipline) as UserProfile["discipline"],
    course: str(p.course),
    destinations: strings(p.destinations) as UserProfile["destinations"],
    openDestination: p.openDestination === true,
    intake: str(p.intake),
    // options can be retired ("Permanent migration" was); drop any a saved journey still holds
    priorities: strings(p.priorities).filter((x): x is PriorityId => (PRIORITY_IDS as readonly string[]).includes(x)),
    qualification: str(p.qualification),
    academicScore: str(p.academicScore),
    tests: strings(p.tests),
    workExperience: str(p.workExperience),
    uniPriorities: strings(p.uniPriorities).filter((x): x is UniPriorityId => (UNI_PRIORITY_IDS as readonly string[]).includes(x)),
    shortlistMode: p.shortlistMode === "own" || p.shortlistMode === "recommend" ? p.shortlistMode : null,
    ownUniversities: strings(p.ownUniversities),
    shortlist: strings(p.shortlist),
    savedUniversities: strings(p.savedUniversities),
    applications: applications(p.applications),
    helpNeeded: strings(p.helpNeeded).filter((x): x is HelpId => oneOf(HELP_IDS)(x)),
    offerSituation: oneOf(OFFER_SITUATIONS)(p.offerSituation) ? p.offerSituation : null,
    offers: offers(p.offers),
    selectedOfferId: str(p.selectedOfferId),
    departureConfirmed: p.departureConfirmed === true,
    departure: departure(p.departure),
    leadCaptured: p.leadCaptured === true,
  };
  const steps: JourneyState["steps"] = {};
  for (const stage of STAGES) if (typeof s[stage] === "string") steps[stage] = s[stage] as string;

  return { version: 1, profile, steps, updatedAt: typeof o.updatedAt === "number" ? o.updatedAt : null };
}

/** Default adapter. Storage can be unavailable (private mode, quota), so every call is guarded. */
export const localJourneyPersistence: JourneyPersistence = {
  load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? coerceJourney(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },
  save(state) {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  },
  clear() {
    try { window.localStorage.removeItem(KEY); } catch { /* storage blocked */ }
  },
};
