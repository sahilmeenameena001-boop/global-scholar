"use client";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsDown, Hand } from "lucide-react";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { nudgeScene } from "@/components/three/sceneStore";
import type { Country } from "@/data/countries";
import { ScrollTrigger } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { CountryCard } from "./CountryCard";
import { RouteLine } from "./RouteLine";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Past either threshold a swipe commits, so a flick and a slow drag both work. */
const DIST = 90;
const VELOCITY = 420;
/** Share of a viewport spent on each country while the deck is pinned. */
const LEG = 0.75;
/** Cards waiting behind the top one. Two reads as a deck without the cost of more. */
const BACKERS = [1, 2];

/**
 * Pinning needs room for the whole stage, so it is reserved for viewports that
 * can hold it. Narrower or shorter screens keep the swipe deck, which is the
 * natural gesture there anyway.
 */
const CAN_PIN = "(min-width: 768px) and (min-height: 700px)";

/** Cards travel along the axis the gesture implies: vertical for scroll, horizontal for swipe. */
const makeVariants = (axis: "x" | "y") => {
  const off = (v: number) => (axis === "x" ? { x: v } : { y: v });
  const rot = (v: number) => (axis === "x" ? { rotate: v } : {});
  return {
    enter: (d: number) => ({ ...off(d > 0 ? 300 : -300), ...rot(d > 0 ? 6 : -6), opacity: 0, scale: 0.94 }),
    center: { x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 },
    exit: (d: number) => ({ ...off(d > 0 ? -320 : 320), ...rot(d > 0 ? -8 : 8), opacity: 0, scale: 0.92 }),
  };
};
const stillVariants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

type LenisLike = { scrollTo: (t: number, o?: { duration?: number }) => void };

type Props = {
  items: Country[];
  /** Builds the compare control for a card, or undefined when compare mode is off. */
  compareFor?: (c: Country) => { pinned: boolean; toggle: () => void; chip: ReactNode } | undefined;
  /** Re-measures the pin when the compare tray changes the page height. */
  compareOpen?: boolean;
};

/**
 * The destinations deck. On a viewport with room the section pins and scrolling
 * flies you from one country to the next, one card per leg. Elsewhere — and
 * whenever motion is reduced — it stays a swipeable deck. Both modes share the
 * same arrows, dots and keyboard handling.
 */
export function CountryDeck({ items, compareFor, compareOpen = false }: Props) {
  const reduce = useReducedMotion();
  const roomy = useMediaQuery(CAN_PIN);
  const scrollMode = roomy && !reduce;

  const [[index, dir], setPos] = useState<[number, number]>([0, 0]);
  const n = items.length;
  const active = items[index];

  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  // the trigger reads this synchronously; state would lag a frame behind the scroll
  const idx = useRef(0);

  useGSAP(
    () => {
      if (!scrollMode || !stage.current || n < 2) return;
      const st = ScrollTrigger.create({
        trigger: stage.current,
        start: "center center",
        end: () => `+=${(n - 1) * window.innerHeight * LEG}`,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.min(n - 1, Math.max(0, Math.round(self.progress * (n - 1))));
          if (next === idx.current) return;
          const step = next > idx.current ? 1 : -1;
          idx.current = next;
          setPos([next, step]);
          nudgeScene(step * 0.45);
        },
      });
      trigger.current = st;
      return () => {
        st.kill();
        trigger.current = null;
      };
    },
    { scope: root, dependencies: [scrollMode, n, compareOpen] },
  );

  /**
   * In scroll mode the scroll position owns the index, so the controls move the
   * page and let the trigger update state. Otherwise they set it directly.
   */
  const goTo = useCallback(
    (next: number, step: number) => {
      const st = trigger.current;
      if (st) {
        const y = st.start + ((st.end - st.start) * next) / Math.max(n - 1, 1);
        const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
        if (lenis) lenis.scrollTo(y, { duration: 0.9 });
        else window.scrollTo({ top: y, behavior: "smooth" });
        return;
      }
      idx.current = next;
      setPos([next, step]);
      nudgeScene(step * 0.55);
    },
    [n],
  );

  const go = useCallback(
    (step: number) => {
      // scrolling is linear, so it clamps; the free deck wraps around
      const next = scrollMode
        ? Math.min(n - 1, Math.max(0, index + step))
        : (index + step + n) % n;
      if (next !== index) goTo(next, step);
    },
    [goTo, index, n, scrollMode],
  );

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > DIST || Math.abs(info.velocity.x) > VELOCITY) {
      go(info.offset.x < 0 ? 1 : -1);
    }
  };

  const variants = reduce ? stillVariants : makeVariants(scrollMode ? "y" : "x");
  const draggable = !reduce && !scrollMode;

  return (
    <div
      ref={root}
      role="group"
      aria-roledescription="carousel"
      aria-label="Study destinations"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go(-1); }
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); go(1); }
      }}
      className="mt-12"
    >
      <div ref={stage} className="mx-auto max-w-md [perspective:1400px]">
        <div className="relative">
          {/* the rest of the deck, peeking out below the live card */}
          {BACKERS.map((o) => {
            const c = items[(index + o) % n];
            return (
              <motion.div
                key={`backer-${o}`}
                aria-hidden
                initial={false}
                animate={{ y: o * 14, scale: 1 - o * 0.05, opacity: 1 - o * 0.35 }}
                transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }}
                className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10 bg-surface shadow-card"
                style={{ borderTopColor: c.accent }}
              />
            );
          })}

          <AnimatePresence custom={dir} initial={false} mode="popLayout">
            <motion.div
              key={active.id}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={reduce ? { duration: 0.15 } : { duration: 0.42, ease: EASE }}
              drag={draggable ? "x" : false}
              dragDirectionLock
              dragElastic={0.16}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={draggable ? onDragEnd : undefined}
              className={draggable ? "relative cursor-grab active:cursor-grabbing" : "relative"}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${n}: ${active.name}`}
            >
              <CountryCard c={active} index={index} entrance={false} compare={compareFor?.(active)} />
            </motion.div>
          </AnimatePresence>
        </div>

        <RouteLine stops={items} active={index} accent={active.accent} />

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous destination"
            disabled={scrollMode && index === 0}
            className="grid size-11 place-items-center rounded-full border border-white/15 text-ivory transition-colors hover:border-royal hover:text-royal-lit disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>

          <ul className="flex items-center gap-1.5">
            {items.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  aria-label={`Show ${c.name}`}
                  aria-current={i === index ? "true" : undefined}
                  className="grid size-11 place-items-center"
                >
                  <motion.span
                    aria-hidden
                    initial={false}
                    animate={{ width: i === index ? 26 : 8, opacity: i === index ? 1 : 0.4 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                    className="block h-2 rounded-full"
                    style={{ backgroundColor: i === index ? active.accent : "#8fa3c8" }}
                  />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next destination"
            disabled={scrollMode && index === n - 1}
            className="grid size-11 place-items-center rounded-full border border-white/15 text-ivory transition-colors hover:border-royal hover:text-royal-lit disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>

        {!reduce && (
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-faint">
            {scrollMode ? (
              <>
                <ChevronsDown aria-hidden className="size-3.5" /> Keep scrolling to fly to the next destination
              </>
            ) : (
              <>
                <Hand aria-hidden className="size-3.5" /> Swipe, drag, or use the arrow keys
              </>
            )}
          </p>
        )}
      </div>

      {/* the only announcement of position, so the visual chrome above stays decorative */}
      <p aria-live="polite" className="sr-only">{`${active.name}, ${index + 1} of ${n}`}</p>
    </div>
  );
}
