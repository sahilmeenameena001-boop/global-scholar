"use client";
import { useEffect, useState } from "react";

/**
 * Tracks which of the given section ids is most in view.
 * Used for nav active states — UX guideline: the current section must be visually indicated.
 */
export function useActiveSection(ids: string[], initial = ids[0] ?? "") {
  const [active, setActive] = useState(initial);

  useEffect(() => {
    const ratios = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target.id, e.intersectionRatio);
        let best = "";
        let top = 0;
        for (const [id, r] of ratios) if (r > top) { top = r; best = id; }
        if (best) setActive(best);
      },
      { threshold: [0, 0.15, 0.35, 0.6, 1] },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return active;
}
