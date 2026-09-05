"use client";
import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query. Returns false during render on the server and on the
 * first client pass, then the real value once hydrated — `useSyncExternalStore`
 * handles that handover without a hydration mismatch.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
