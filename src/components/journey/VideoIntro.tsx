"use client";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { journeyIntro, stages } from "@/data/journey/config";
import { homeCopy } from "@/data/journey/home";
import { track } from "@/lib/journey/analytics";
import type { Stage } from "@/lib/journey/types";
import { stageWorld } from "@/lib/journey/worlds";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { FloatingCTA } from "./FloatingCTA";
import { HeadWindow } from "./HeadWindow";
import { useGoToStage } from "./useGoToStage";

const { video: film } = journeyIntro;
const TONES = ["ivory", "sky", "ivory", "coral"] as const;
const TILTS = [-3, 2.5, -1.5, 3];
/** How long the pointer must rest on a card before the head changes, so crossing cards doesn't flicker. */
const HOVER_INTENT_MS = 120;

/**
 * The film is a 9:16 frame at full height. Phones are narrower than that, so
 * the frame overflows and is cropped; the crop is biased right (22% rather
 * than 50%) so the "What's on your mind?" bubble on its left edge stays whole.
 */
const FRAME_LEFT = "max(calc((100% - 56.25svh) * 0.22), calc((100% - 56.25svh) * 0.5))";

/**
 * Desktop places the four answers either side of the portrait film, level
 * with the open head. Half the film's width is 28.125svh.
 */
const BESIDE = [
  "lg:right-[calc(50%+28.125svh+2rem)] lg:top-[30%]",
  "lg:left-[calc(50%+28.125svh+2rem)] lg:top-[26%]",
  "lg:right-[calc(50%+28.125svh+3.5rem)] lg:top-[50%]",
  "lg:left-[calc(50%+28.125svh+3.5rem)] lg:top-[46%]",
];

/**
 * Home: a single question. The film opens the head; once it is fully open the
 * four states appear. Hovering one fills the head with that state's world and
 * reveals its call to action; clicking it opens that state's own full-screen
 * page (`/journey/<stage>`).
 *
 * Tap anywhere (or "Skip intro") to jump to the open head. Under reduced
 * motion, or if the film cannot play, the open frame shows as a still.
 */
export function VideoIntro({ onBack }: {
  /** Shown to returning students who reopened the film: back to their dashboard. */
  onBack?: () => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const { go, warm } = useGoToStage(null);

  const [open, setOpen] = useState(false);
  const [still, setStill] = useState(false);
  const [hovered, setHovered] = useState<Stage | null>(null);
  const focusFirst = useRef(false);
  const intent = useRef<number | undefined>(undefined);

  useEffect(() => {
    track("hero_view", { returning: !!onBack });
    return () => window.clearTimeout(intent.current);
  }, [onBack]);

  const hoverStart = (s: Stage) => {
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => { setHovered(s); track("journey_hover", { journeyStage: s }); }, HOVER_INTENT_MS);
  };
  const hoverEnd = (s: Stage) => {
    window.clearTimeout(intent.current);
    setHovered((h) => (h === s ? null : h));
  };

  const revealed = open || reduce;
  const showStill = still || reduce;
  const world = useMemo(() => (hovered ? stageWorld(hovered) : null), [hovered]);

  /** Jump to the open head: end of the film, answers in. */
  const reveal = useCallback((focus = false) => {
    const v = ref.current;
    if (v && !v.ended && Number.isFinite(v.duration)) { v.pause(); v.currentTime = v.duration; }
    focusFirst.current = focus;
    setOpen(true);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    const giveUp = () => { setStill(true); setOpen(true); };
    // autoplay can be refused (low-power mode, data saver); never leave the student waiting
    const stall = window.setTimeout(() => { if (v.currentTime === 0) giveUp(); }, film.stallMs);
    v.play()?.catch(giveUp);
    return () => window.clearTimeout(stall);
  }, [reduce]);

  const focusOnMount = useCallback((el: HTMLButtonElement | null) => {
    if (el && focusFirst.current) { focusFirst.current = false; el.focus(); }
  }, []);

  return (
    <section
      aria-labelledby="intro-title"
      data-chapter={0}
      onClick={revealed ? undefined : () => reveal()}
      className="relative isolate h-[100svh] overflow-hidden bg-matte"
    >
      <h1 id="intro-title" className="sr-only">{journeyIntro.title}</h1>

      {onBack && revealed && (
        <button type="button" onClick={onBack}
          className="absolute right-4 top-24 z-20 inline-flex min-h-11 items-center gap-2 rounded-full bg-void/60 px-4 text-sm font-semibold text-ivory ring-1 ring-inset ring-white/20 backdrop-blur-sm hover:ring-white/40 sm:right-8">
          <ArrowLeft aria-hidden className="size-4" /> {homeCopy.back}
        </button>
      )}

      {!revealed && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); reveal(true); }}
          className="sr-only focus:not-sr-only focus:absolute focus:bottom-6 focus:left-1/2 focus:z-20 focus:min-h-11 focus:-translate-x-1/2 focus:rounded-full focus:bg-ivory focus:px-5 focus:text-sm focus:font-semibold focus:text-ink"
        >
          {journeyIntro.skip}
        </button>
      )}

      {/* the film, with the inside of the head layered over its opening */}
      <div aria-hidden className="grain absolute inset-0">
        <div
          className="absolute top-0 h-full lg:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
          style={{ aspectRatio: "9 / 16", left: FRAME_LEFT }}
        >
          {showStill ? (
            // eslint-disable-next-line @next/next/no-img-element -- one frame matched to the film; no resizing wanted
            <img src={film.still} alt="" className="size-full object-cover" />
          ) : (
            <video
              ref={ref}
              src={film.src}
              poster={film.poster}
              muted
              playsInline
              preload="auto"
              onEnded={() => setOpen(true)}
              onError={() => { setStill(true); setOpen(true); }}
              className="size-full object-cover"
            />
          )}
          {revealed && <HeadWindow world={world} />}
        </div>
      </div>

      {revealed && (
        <ul
          aria-label={journeyIntro.title}
          className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-x-3 gap-y-5 bg-gradient-to-t from-matte via-matte/70 to-transparent px-4 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-20 lg:contents"
        >
          {stages.map((s, i) => (
            <li key={s.id} className={`lg:absolute ${BESIDE[i]}`}>
              <FloatingCTA
                ref={i === 0 ? focusOnMount : undefined}
                variant="note"
                tone={TONES[i]}
                kicker={s.arc}
                label={s.cta}
                hint={s.hoverCta}
                active={hovered === s.id}
                tilt={TILTS[i]}
                index={i * 3}
                onClick={() => go(s.id, "home-intro")}
                onIntent={() => { hoverStart(s.id); warm(s.id); }}
                onLeave={() => hoverEnd(s.id)}
                className="w-full lg:w-[13.5rem]"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
