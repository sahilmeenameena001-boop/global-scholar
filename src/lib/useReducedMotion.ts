"use client";
import { useSyncExternalStore } from "react";

const MQ = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(MQ);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

/** Hydration-safe reduced-motion flag: false on the server and during hydration, then the real value. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(MQ).matches, () => false);
}
