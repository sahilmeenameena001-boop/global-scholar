"use client";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { DECIDE, exploringCopy, journeyIntro, stages } from "@/data/journey/config";
import { profileMeta, track } from "@/lib/journey/analytics";
import { explorationSummary } from "@/lib/journey/explore";
import { journey, useJourney } from "@/lib/journey/store";
import type { ExploringStep, Stage } from "@/lib/journey/types";
import {
  destinationWorld, disciplineWorld, intakeWorld, prioritiesWorld, resultWorld, stageWorld, type World,
} from "@/lib/journey/worlds";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { LeadForm } from "../ui/LeadForm";
import { Modal } from "../ui/Modal";
import { ExploreFunnel, type Preview } from "./ExploreFunnel";
import { FloatingCTA } from "./FloatingCTA";
import { HeadWindow } from "./HeadWindow";
import { useGoToStage } from "./useGoToStage";

const { video: film } = journeyIntro;
const TONES = ["ivory", "sky", "ivory", "coral"] as const;
const TILTS = [-3, 2.5, -1.5, 3];

/**
 * The film is a 9:16 frame at full height. Phones are narrower than that, so
 * the frame overflows and is cropped; the crop is biased right (22% rather
 * than 50%) so the "What's on your mind?" bubble on its left edge stays whole.
 */
const FRAME_LEFT = "max(calc((100% - 56.25svh) * 0.22), calc((100% - 56.25svh) * 0.5))";
/** Once a question is open on a phone, the head shrinks to the top of the screen to make room. */
const PHONE_LOCKED_SCALE = 0.62;

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

const sizeSub = (cb: () => void) => { window.addEventListener("resize", cb); return () => window.removeEventListener("resize", cb); };
/** Horizontal transform origin that keeps a shrinking frame centred on the screen, as a fraction of the frame. */
const centreOrigin = () => {
  const vw = window.innerWidth;
  const W = window.innerHeight * 0.5625;
  const left = Math.max((vw - W) * 0.22, (vw - W) * 0.5);
  return (vw / 2 - left) / W;
};

/**
 * Home: a single question. The film opens the head; once it is fully open the
 * four states appear. Hovering one fills the head with that state's world
 * (Exploring: possibility overload) and reveals its call to action. Clicking
 * Exploring locks it in place — the other three fade — and the funnel runs
 * here, inside the same head: every hover previews, every pick reshapes it,
 * until the answers resolve into one personalised world. The other states lead
 * to their own pages.
 *
 * Tap anywhere (or "Skip intro") to jump to the open head. Under reduced
 * motion, or if the film cannot play, the open frame shows as a still.
 */
export function VideoIntro({ startExploring = false }: { startExploring?: boolean }) {
  const reduce = useReducedMotion();
  const lg = useMediaQuery("(min-width: 1024px)");
  const originX = useSyncExternalStore(sizeSub, centreOrigin, () => 0.5);
  const ref = useRef<HTMLVideoElement>(null);
  const { profile } = useJourney();
  const { go, warm } = useGoToStage(null);

  const [open, setOpen] = useState(startExploring);
  const [still, setStill] = useState(startExploring);
  const [locked, setLocked] = useState(startExploring);
  const [hovered, setHovered] = useState<Stage | null>(null);
  const [step, setStep] = useState<ExploringStep>("course");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [talk, setTalk] = useState(false);
  const focusFirst = useRef(false);

  const revealed = open || reduce;
  const showStill = still || reduce;

  /** Jump to the open head: end of the film, answers in. */
  const reveal = useCallback((focus = false) => {
    const v = ref.current;
    if (v && !v.ended && Number.isFinite(v.duration)) { v.pause(); v.currentTime = v.duration; }
    focusFirst.current = focus;
    setOpen(true);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduce || startExploring) return;
    const giveUp = () => { setStill(true); setOpen(true); };
    // autoplay can be refused (low-power mode, data saver); never leave the student waiting
    const stall = window.setTimeout(() => { if (v.currentTime === 0) giveUp(); }, film.stallMs);
    v.play()?.catch(giveUp);
    return () => window.clearTimeout(stall);
  }, [reduce, startExploring]);

  const focusOnMount = useCallback((el: HTMLButtonElement | null) => {
    if (el && focusFirst.current) { focusFirst.current = false; el.focus(); }
  }, []);

  const pick = (s: Stage) => {
    if (s !== "exploring") { go(s, "home-intro"); return; }
    const current = journey.get().profile;
    if (!current.journeyStage) track("journey_started", { ...profileMeta(current, s), source: "home-intro" });
    track("journey_stage_selected", { ...profileMeta(current, s), source: "home-intro" });
    journey.setStage("exploring");
    setHovered(null);
    setStep("course");
    setLocked(true);
  };

  const unlock = () => { setLocked(false); setPreview(null); };
  const closeTalk = useCallback(() => setTalk(false), []);

  /** What the inside of the head shows right now. `null` leaves the film's own collage on show. */
  const world: World | null = useMemo(() => {
    if (!locked) return hovered ? stageWorld(hovered) : null;
    const p = preview;
    switch (step) {
      case "course": {
        const id = p?.kind === "discipline" ? p.id : profile.discipline;
        return id ? disciplineWorld(id) : stageWorld("exploring");
      }
      case "destination": {
        const id = p?.kind === "destination" ? p.id : profile.destinations[0] ?? (profile.openDestination ? DECIDE : null);
        if (id) return destinationWorld(id);
        return profile.discipline ? disciplineWorld(profile.discipline) : stageWorld("exploring");
      }
      case "intake": return intakeWorld(p?.kind === "intake" ? p.id : profile.intake);
      case "priorities": return prioritiesWorld(profile.priorities, p?.kind === "priority" ? p.id : null);
      case "result": return resultWorld(profile);
    }
  }, [locked, hovered, preview, step, profile]);

  const shrink = locked && !lg;

  return (
    <section
      aria-labelledby="intro-title"
      data-chapter={0}
      onClick={revealed ? undefined : () => reveal()}
      className="relative isolate h-[100svh] overflow-hidden bg-matte"
    >
      <h1 id="intro-title" className="sr-only">{journeyIntro.title}</h1>

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
        <motion.div
          className="absolute top-0 h-full lg:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
          style={{ aspectRatio: "9 / 16", left: FRAME_LEFT, originX: lg ? 0.5 : originX, originY: shrink ? 0 : 0.5 }}
          initial={false}
          animate={{ scale: shrink ? PHONE_LOCKED_SCALE : 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
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
        </motion.div>
      </div>

      <LayoutGroup>
        <AnimatePresence>
        {revealed && !locked && (
          <motion.ul
            key="states"
            exit={{ opacity: 1 }}
            aria-label={journeyIntro.title}
            className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-x-3 gap-y-5 bg-gradient-to-t from-matte via-matte/70 to-transparent px-4 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-20 lg:contents"
          >
            {stages.map((s, i) => (
              <li key={s.id} className={`lg:absolute ${BESIDE[i]}`}>
                {/* Exploring morphs into the locked card; the other three fade away */}
                <motion.div layoutId={`stage-${s.id}`} exit={s.id === "exploring" ? undefined : { opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}>
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
                    onClick={() => pick(s.id)}
                    onIntent={() => { setHovered(s.id); if (s.id !== "exploring") warm(s.id); }}
                    onLeave={() => setHovered((h) => (h === s.id ? null : h))}
                    className="w-full lg:w-[13.5rem]"
                  />
                </motion.div>
              </li>
            ))}
          </motion.ul>
        )}
        </AnimatePresence>

        {locked && (
          <div
            data-lenis-prevent
            className="absolute inset-x-0 bottom-0 max-h-[60svh] overflow-y-auto rounded-t-3xl border-t border-ivory/10 bg-matte/95 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-lift backdrop-blur-md lg:contents"
          >
            <ExploreFunnel
              profile={profile}
              step={step}
              onStep={setStep}
              onPreview={setPreview}
              onUnlock={unlock}
              onBestFit={() => {
                track("stage_cta_clicked", { ...profileMeta(journey.get().profile, "exploring"), cta: "best-fit" });
                go("shortlisting", "home-explore-result");
              }}
              onCounsellor={() => {
                track("counsellor_cta_clicked", { ...profileMeta(journey.get().profile, "exploring"), source: "home-explore-result" });
                setTalk(true);
              }}
            />
          </div>
        )}
      </LayoutGroup>

      <Modal open={talk} onClose={closeTalk} title={exploringCopy.result.modal} gate>
        <LeadForm compact context={explorationSummary(profile)} />
      </Modal>
    </section>
  );
}
