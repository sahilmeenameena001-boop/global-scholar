"use client";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { exploringCopy, journeyIntro, stages } from "@/data/journey/config";
import { offerCopy } from "@/data/journey/offer";
import { profileMeta, track } from "@/lib/journey/analytics";
import { applicationsSummary, nextAction, todayISO, uniName } from "@/lib/journey/applying";
import { explorationSummary } from "@/lib/journey/explore";
import { firstOpenStep } from "@/lib/journey/lifecycle";
import { moveSummary } from "@/lib/journey/offer";
import { evaluateList, shortlistSummary } from "@/lib/journey/shortlist";
import { journey, useJourney } from "@/lib/journey/store";
import type { Application, ExploringStep, Stage } from "@/lib/journey/types";
import { applyWorld, exploringWorld, offerWorld, shortlistWorld, stageWorld, type Preview, type World } from "@/lib/journey/worlds";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { LeadForm } from "../ui/LeadForm";
import { Modal } from "../ui/Modal";
import { ExploreFunnel } from "./ExploreFunnel";
import { FloatingCTA } from "./FloatingCTA";
import { HeadWindow } from "./HeadWindow";
import { InHeadStage } from "./InHeadStage";

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

/** Where a state starts when it's picked. Exploring always opens on its first question, as it always has. */
const startStep = (s: Stage) => (s === "exploring" ? "course" : firstOpenStep(s, journey.get().profile));

/**
 * Home: a single question. The film opens the head; once it is fully open the
 * four states appear. Hovering one fills the head with that state's world and
 * reveals its call to action. Clicking any of them locks it in place — the
 * other three fade — and that state's questions run here, inside the same
 * head: every hover previews, every answer reshapes it.
 *
 * `?state=<stage>` (with an optional `&step=`) opens straight into a state,
 * skipping the film; the old `/journey/<stage>` links redirect here.
 *
 * Tap anywhere (or "Skip intro") to jump to the open head. Under reduced
 * motion, or if the film cannot play, the open frame shows as a still.
 */
export function VideoIntro({ initialState = null, initialStep = null }: { initialState?: Stage | null; initialStep?: string | null }) {
  const reduce = useReducedMotion();
  const lg = useMediaQuery("(min-width: 1024px)");
  const originX = useSyncExternalStore(sizeSub, centreOrigin, () => 0.5);
  const ref = useRef<HTMLVideoElement>(null);
  const { profile } = useJourney();

  const [open, setOpen] = useState(!!initialState);
  const [still, setStill] = useState(!!initialState);
  const [locked, setLocked] = useState<Stage | null>(initialState);
  const [hovered, setHovered] = useState<Stage | null>(null);
  const [step, setStepState] = useState<string>(() => initialStep ?? (initialState ? startStep(initialState) : "course"));
  const [preview, setPreview] = useState<Preview | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [talk, setTalk] = useState<string | null>(null);
  const [today] = useState(() => todayISO());
  const focusFirst = useRef(false);
  const moved = useRef(false);

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
    if (!v || reduce || initialState) return;
    const giveUp = () => { setStill(true); setOpen(true); };
    // autoplay can be refused (low-power mode, data saver); never leave the student waiting
    const stall = window.setTimeout(() => { if (v.currentTime === 0) giveUp(); }, film.stallMs);
    v.play()?.catch(giveUp);
    return () => window.clearTimeout(stall);
  }, [reduce, initialState]);

  const focusOnMount = useCallback((el: HTMLButtonElement | null) => {
    if (el && focusFirst.current) { focusFirst.current = false; el.focus(); }
  }, []);

  const setStep = useCallback((s: string) => { moved.current = true; setPreview(null); setStepState(s); }, []);
  /** After a step change, focus lands on the new prompt so it is announced. */
  const focusRef = useCallback((el: HTMLHeadingElement | null) => { if (el && moved.current) el.focus(); }, []);

  /** Lock a state inside the head: from a card, or handed on from another state. */
  const lock = (s: Stage, at?: string, source = "home-intro") => {
    const current = journey.get().profile;
    if (!current.journeyStage) track("journey_started", { ...profileMeta(current, s), source });
    track("journey_selected", { ...profileMeta(current, s), from: locked, source });
    track("journey_stage_selected", { ...profileMeta(current, s), from: locked, source });
    journey.setStage(s);
    setHovered(null);
    setPreview(null);
    setCompareIds([]);
    moved.current = !!locked;
    setStepState(at ?? startStep(s));
    setLocked(s);
  };

  const unlock = () => { setLocked(null); setPreview(null); };
  const closeTalk = useCallback(() => setTalk(null), []);
  const counsellor = (stage: Stage, source: string) => {
    track("counsellor_cta_clicked", { ...profileMeta(journey.get().profile, stage), source });
    setTalk(source);
  };

  /** Shortlist → applying: one application per shortlisted university (keeping any already tracked), then their statuses. */
  const planApplications = () => {
    const p = journey.get().profile;
    const tracked = new Set(p.applications.map((a) => a.university));
    const added: Application[] = p.shortlist.filter((id) => !tracked.has(id)).map((id) => ({ university: id, status: "notStarted", pending: [], dates: {} }));
    journey.patch({ applications: [...p.applications, ...added] });
    track("shortlist_completed", { ...profileMeta(p, "shortlisting"), universities: p.shortlist });
    lock("applying", "status", "shortlist-final");
  };

  const list = useMemo(() => evaluateList(profile.shortlist, profile), [profile]);
  const action = useMemo(() => nextAction(profile.applications, today), [profile.applications, today]);

  /** What the inside of the head shows right now. `null` leaves the film's own collage on show. */
  const world: World | null = useMemo(() => {
    if (!locked) return hovered ? stageWorld(hovered) : null;
    switch (locked) {
      case "exploring": return exploringWorld(step as ExploringStep, preview, profile);
      case "shortlisting": return shortlistWorld(step as never, preview, profile, list, compareIds);
      case "applying": return applyWorld(step as never, preview, profile, today, action);
      case "offer": return offerWorld(step as never, profile, today);
    }
  }, [locked, hovered, preview, step, profile, list, compareIds, today, action]);

  const context = useMemo(() => {
    switch (locked) {
      case "shortlisting": return shortlistSummary(profile.shortlist);
      case "applying": return applicationsSummary(profile.applications, today);
      case "offer": return `Offer: ${profile.offers.map((o) => uniName(o.university)).join(", ") || "none yet"}. ${moveSummary(profile).map((r) => `${r.label} ${r.value}`).join(", ")}`.slice(0, 200);
      default: return explorationSummary(profile);
    }
  }, [locked, profile, today]);

  const shrink = !!locked && !lg;

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
                {/* the picked card morphs into the locked card; the other three fade away */}
                <motion.div layoutId={`stage-${s.id}`} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}>
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
                    onClick={() => lock(s.id)}
                    onIntent={() => setHovered(s.id)}
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
            {locked === "exploring" ? (
              <ExploreFunnel
                profile={profile}
                step={step as ExploringStep}
                onStep={setStep}
                onPreview={setPreview}
                onUnlock={unlock}
                onBestFit={() => {
                  track("stage_cta_clicked", { ...profileMeta(journey.get().profile, "exploring"), cta: "best-fit" });
                  lock("shortlisting", undefined, "home-explore-result");
                }}
                onCounsellor={() => counsellor("exploring", "home-explore-result")}
              />
            ) : (
              <InHeadStage
                key={locked}
                stage={locked}
                step={step}
                profile={profile}
                today={today}
                list={list}
                action={action}
                compareIds={compareIds}
                onCompareIds={setCompareIds}
                onStep={setStep}
                onPreview={setPreview}
                onUnlock={unlock}
                onCounsellor={(source) => counsellor(locked, source)}
                onSwitch={(to, at) => lock(to, at, `${locked}-handoff`)}
                onPlan={planApplications}
                focusRef={focusRef}
              />
            )}
          </div>
        )}
      </LayoutGroup>

      <Modal open={!!talk} onClose={closeTalk} title={locked === "offer" ? offerCopy.modal : exploringCopy.result.modal} gate>
        <LeadForm compact context={context} onSuccess={() => {
          journey.patch({ leadCaptured: true });
          track("lead_created", { ...profileMeta(journey.get().profile, locked), source: talk ?? "home" });
        }} />
      </Modal>
    </section>
  );
}
