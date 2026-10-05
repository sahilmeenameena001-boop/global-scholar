"use client";
import { useSyncExternalStore } from "react";
import { coerceJourney, initialJourney, localJourneyPersistence, type JourneyPersistence } from "./persistence";
import type { JourneyState, Stage, UserProfile } from "./types";

/**
 * The journey's single source of truth: a tiny external store read through
 * `useSyncExternalStore`. Components never touch storage; they call the
 * actions below, and the store hands each new state to the configured
 * persistence adapter.
 */

let state: JourneyState = initialJourney;
let persistence: JourneyPersistence = localJourneyPersistence;
let loaded = false;
/** True once the saved journey (if any) has been read. */
let ready = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function hydrate(saved: JourneyState | null) {
  // a write made before an async load resolved wins over the stale saved copy
  if (saved && state.updatedAt === null) state = saved;
  ready = true;
  emit();
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const result = persistence.load();
  if (result instanceof Promise) result.then(hydrate, () => hydrate(null));
  else hydrate(result);
}

function commit(next: JourneyState) {
  state = { ...next, updatedAt: Date.now() };
  emit();
  void Promise.resolve(persistence.save(state)).catch(() => {});
}

/** Swap the storage backend. Call once, before the journey mounts. */
export function configureJourneyPersistence(adapter: JourneyPersistence) {
  persistence = adapter;
  loaded = false;
  ready = false;
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  load();
  return () => { listeners.delete(cb); };
};

export const journey = {
  get: () => state,

  setStage(stage: Stage) {
    commit({ ...state, profile: { ...state.profile, journeyStage: stage } });
  },

  setStep(stage: Stage, step: string) {
    if (state.steps[stage] === step) return;
    commit({ ...state, steps: { ...state.steps, [stage]: step } });
  },

  patch(partial: Partial<UserProfile>) {
    commit({ ...state, profile: { ...state.profile, ...partial } });
  },

  reset() {
    state = { ...initialJourney, updatedAt: Date.now() };
    emit();
    void Promise.resolve(persistence.clear()).catch(() => {});
  },

  /** Exposed for adapters that sync from elsewhere (another tab, a server). */
  replace(next: unknown) {
    const valid = coerceJourney(next);
    if (valid) { state = valid; emit(); }
  },
};

/** The current journey, re-rendering on change. The server and first client pass see the empty state. */
export function useJourney() {
  return useSyncExternalStore(subscribe, journey.get, () => initialJourney);
}

/**
 * True once saved progress has been read on the client. Render anything that
 * depends on where the student left off behind this, so it mounts on the right
 * step instead of flashing the first one and animating across.
 */
export function useJourneyReady() {
  return useSyncExternalStore(subscribe, () => ready, () => false);
}
