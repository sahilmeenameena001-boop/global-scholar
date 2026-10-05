"use client";
import { useSyncExternalStore } from "react";
import { coerceJourney, initialJourney, localJourneyPersistence, type JourneyPersistence } from "./persistence";
import type { JourneyState, Stage, UserProfile } from "./types";

/**
 * The journey's single source of truth: a tiny external store read through
 * `useSyncExternalStore`. Components never touch storage; they call the
 * actions below, and the store hands each new state to the configured
 * persistence adapter.
 *
 * Saved progress is loaded before anything reads or writes it — not only when
 * a component subscribes — so an action fired from a page that never rendered
 * the journey (the home film's state cards) builds on the student's saved
 * answers instead of overwriting them with an empty profile.
 */

type Op = (s: JourneyState) => JourneyState;

let state: JourneyState = initialJourney;
let persistence: JourneyPersistence = localJourneyPersistence;
let loaded = false;
/** True once the saved journey (if any) has been read. */
let ready = false;
/** Changes made while an async load was still in flight; replayed on top of the saved copy. */
const queued: Op[] = [];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const save = () => void Promise.resolve(persistence.save(state)).catch(() => {});

function hydrate(saved: JourneyState | null) {
  if (saved) state = saved;
  const replay = queued.splice(0);
  for (const op of replay) state = op(state);
  ready = true;
  if (replay.length) { state = { ...state, updatedAt: Date.now() }; save(); }
  emit();
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  let result: ReturnType<JourneyPersistence["load"]>;
  try { result = persistence.load(); } catch { result = null; }
  if (result instanceof Promise) result.then(hydrate, () => hydrate(null));
  else hydrate(result);
}

/**
 * Apply a change. Before the saved journey has arrived (an async adapter),
 * the change is shown at once but held back from storage, then replayed on
 * the saved copy — so an early tap can never erase what was saved.
 */
function commit(op: Op) {
  load();
  state = { ...op(state), updatedAt: Date.now() };
  if (ready) save();
  else queued.push(op);
  emit();
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

/** Render-safe read for `useSyncExternalStore`; never triggers a load itself. */
const snapshot = () => state;

export const journey = {
  /** The current journey, loading the saved copy first. For event handlers, not render. */
  get: () => { load(); return state; },

  setStage(stage: Stage) {
    commit((s) => ({ ...s, profile: { ...s.profile, journeyStage: stage } }));
  },

  setStep(stage: Stage, step: string) {
    if (journey.get().steps[stage] === step) return;
    commit((s) => ({ ...s, steps: { ...s.steps, [stage]: step } }));
  },

  patch(partial: Partial<UserProfile>) {
    commit((s) => ({ ...s, profile: { ...s.profile, ...partial } }));
  },

  reset() {
    load();
    queued.length = 0;
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
  return useSyncExternalStore(subscribe, snapshot, () => initialJourney);
}

/**
 * True once saved progress has been read on the client. Render anything that
 * depends on where the student left off behind this, so it mounts on the right
 * step instead of flashing the first one and animating across.
 */
export function useJourneyReady() {
  return useSyncExternalStore(subscribe, () => ready, () => false);
}
