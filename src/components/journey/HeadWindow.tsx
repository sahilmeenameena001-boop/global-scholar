"use client";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { destinationById } from "@/data/journey/destinations";
import type { Backdrop, World } from "@/lib/journey/worlds";
import { CountryArt } from "../ui/CountryArt";
import { CrossfadeVideo } from "./media/CrossfadeVideo";
import { useHeadMedia } from "./media/HeadMediaProvider";
import { ThoughtCanvas } from "./ThoughtCanvas";

/**
 * Where the film's head opening sits, in percent of the 9:16 frame. Measured
 * on the final (fully open) frame of `header-intro.mp4`; re-measure if the
 * film is replaced.
 */
export const HEAD_SLOT = { top: 27.5, height: 27.5, left: 1, right: 1 };

/** Torn paper along the top and bottom edges, so the window reads as the inside of the head. */
const TORN = (() => {
  const n = 28;
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100;
    top.push(`${x.toFixed(2)}% ${(i % 2 ? 3.5 : 0.5) + (i % 5 === 0 ? 1.5 : 0)}%`);
    bottom.unshift(`${x.toFixed(2)}% ${(i % 2 ? 96.5 : 99.5) - (i % 7 === 0 ? 1.5 : 0)}%`);
  }
  return `polygon(${[...top, ...bottom].join(", ")})`;
})();

const TINT: Record<"royal" | "coral" | "sky", string> = {
  royal: "rgba(91,134,255,0.38)",
  coral: "rgba(240,107,93,0.38)",
  sky: "rgba(221,235,255,0.28)",
};

const backdropKey = (b: Backdrop) => (b.kind === "country" ? `country-${b.destination}` : b.kind === "tint" ? `tint-${b.tone}` : b.kind);

function BackdropLayer({ b }: { b: Backdrop }) {
  switch (b.kind) {
    case "country":
      return (
        <>
          <CountryArt c={destinationById[b.destination].art} active className="absolute inset-0 size-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-void/55 via-transparent to-void/30" />
        </>
      );
    case "timeline":
      return (
        <div className="absolute inset-0 bg-matte">
          <div className="absolute inset-x-[6%] top-[60%] border-t-2 border-dashed border-ivory/35" />
        </div>
      );
    case "tint":
      return <div className="absolute inset-0 bg-matte" style={{ backgroundImage: `radial-gradient(ellipse at 50% 50%, ${TINT[b.tone]}, transparent 70%)` }} />;
    case "matte":
      return <div className="absolute inset-0 bg-matte" />;
  }
}

/**
 * The inside of the head. On the home film it sits over the head's opening,
 * hidden while the film's own collage is on show; on a stage page it fills a
 * torn-paper thought panel. Either way it shows the world for whatever is
 * hovered or chosen — backdrop cross-fading, objects spilling out from the middle.
 * Decorative: every choice it shows is also named in text beside it.
 */
export function HeadWindow({ world, fill = false }: {
  world: World | null;
  /** Fill the parent (a standalone thought panel) instead of sitting in the film's head slot. */
  fill?: boolean;
}) {
  const still = useMotionValue(0);
  const media = useHeadMedia();
  const set = world ? media[world.key] : undefined;
  const inside = world?.items.filter((i) => !i.overflow) ?? [];
  const outside = world?.items.filter((i) => i.overflow) ?? [];
  return (
    <AnimatePresence>
      {world && (
        <motion.div
          key="window"
          aria-hidden
          className="absolute"
          style={fill ? { inset: 0 } : { top: `${HEAD_SLOT.top}%`, height: `${HEAD_SLOT.height}%`, left: `${HEAD_SLOT.left}%`, right: `${HEAD_SLOT.right}%` }}
          initial={{ opacity: 0, scaleY: 0.55 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0.55 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
        {/* everything inside the head is clipped to the torn opening */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: TORN }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={backdropKey(world.backdrop)}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              <BackdropLayer b={world.backdrop} />
            </motion.div>
          </AnimatePresence>
          <ThoughtCanvas items={inside} lg={false} profile={world.motion} mx={still} my={still} origin={{ x: 50, y: 50 }} />
          {/* produced footage for this state, when it has been dropped in; the drawn world stays underneath as fallback */}
          {set && <CrossfadeVideo mediaKey={world.key} set={set} />}
          <div className="grain absolute inset-0 shadow-[inset_0_14px_26px_rgba(4,7,13,0.55),inset_0_-14px_26px_rgba(4,7,13,0.55)]" />
        </div>
        {/* the few objects allowed to break out of the head */}
        {outside.length > 0 && !set && (
          <ThoughtCanvas items={outside} lg={false} profile={world.motion} mx={still} my={still} origin={{ x: 50, y: 50 }} />
        )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A standalone thought: the head's inside, torn out and pinned to a stage
 * page. Previews whatever the student hovers or picks.
 */
export function ThoughtPanel({ world, className = "" }: { world: World; className?: string }) {
  return (
    <div aria-hidden className={`relative aspect-[2/1] w-full drop-shadow-[0_24px_40px_rgba(4,7,13,0.65)] ${className}`}>
      <HeadWindow world={world} fill />
    </div>
  );
}
