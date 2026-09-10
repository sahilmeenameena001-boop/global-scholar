"use client";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { railStops } from "@/data/nav";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useFinePointer } from "./ui/fx";

/**
 * Ruler-style site index: one mark per page, the bar length marks the stop you
 * are on and the gradient rides the scroll of the current page. Pointer-only —
 * touch devices get the header menu instead.
 */
export function ChapterRail() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });

  if (!fine) return null;

  return (
    <nav aria-label="Chapters" className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 2xl:block">
      <ul className="flex flex-col items-end gap-4">
        {railStops.map((s) => {
          const on = pathname === s.href;
          return (
            <li key={s.href} className="group relative flex items-center justify-end gap-3">
              <span
                aria-hidden
                className={`pointer-events-none whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 ${on ? "opacity-100 text-ivory" : "translate-x-1 opacity-0 text-faint group-hover:translate-x-0 group-hover:opacity-100"}`}
              >
                {s.rail}
              </span>
              <Link
                href={s.href}
                aria-current={on ? "page" : undefined}
                aria-label={`Go to ${s.label}`}
                className="relative flex h-6 items-center"
              >
                <span
                  className={`block h-px transition-all duration-300 ${on ? "w-9 bg-royal-lit" : "w-4 bg-white/25 group-hover:w-7 group-hover:bg-white/50"}`}
                />
                {on && (
                  <motion.span
                    layoutId="rail-dot"
                    aria-hidden
                    className="absolute -right-2 size-1.5 rounded-full bg-coral"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div aria-hidden className="absolute -left-4 top-0 h-full w-px overflow-hidden bg-white/10">
        <motion.span className="block h-full w-full origin-top bg-gradient-to-b from-royal-lit to-coral" style={{ scaleY: reduce ? scrollYProgress : progress }} />
      </div>
    </nav>
  );
}
