import { emptyProfile, isStage, PRIORITY_IDS, STAGES, type JourneyState, type PriorityId, type UserProfile } from "./types";

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
    shortlist: strings(p.shortlist),
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
