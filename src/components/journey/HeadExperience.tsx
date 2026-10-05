"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import type { MotionProfile, SceneItem } from "@/lib/journey/types";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useFinePointer } from "../ui/fx";
import { HeadFigure } from "./HeadFigure";
import { ThoughtCanvas } from "./ThoughtCanvas";

const GLOW: Record<MotionProfile, string> = {
  drift: "rgba(91,134,255,0.42)",
  snap: "rgba(221,235,255,0.32)",
  pipeline: "rgba(240,107,93,0.30)",
  settle: "rgba(247,244,236,0.30)",
};

/**
 * The persistent visual container: an open head with its thoughts spilling
 * out. Mounted once by `ScholarJourney` and fed new items as the student
 * answers, so the world reorganises rather than reloading.
 *
 * `overlay` holds anything interactive that lives inside the scene (the
 * opening screen's thought CTAs); it sits above the decorative canvas.
 */
export function HeadExperience({
  items, profile, overlay,
}: { items: SceneItem[]; profile: MotionProfile; overlay?: React.ReactNode }) {
  const lg = useMediaQuery("(min-width: 1024px)");
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const parallax = fine && !reduce;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 18 });
  const my = useSpring(rawY, { stiffness: 60, damping: 18 });

  // the head opens a beat after it appears
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), reduce ? 0 : 280);
    return () => window.clearTimeout(t);
  }, [reduce]);

  return (
    <div
      className="relative isolate aspect-[10/11] w-full select-none lg:aspect-[16/11]"
      onPointerMove={parallax ? (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rawX.set(((e.clientX - r.left) / r.width) * 2 - 1);
        rawY.set(((e.clientY - r.top) / r.height) * 2 - 1);
      } : undefined}
      onPointerLeave={parallax ? () => { rawX.set(0); rawY.set(0); } : undefined}
    >
      {/* light pouring out of the opening; its colour follows the stage */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[62%] h-[70%] w-[95%] -translate-x-1/2 -translate-y-[62%] rounded-[50%]"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.6, background: `radial-gradient(closest-side, ${GLOW[profile]}, transparent)` }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      <HeadFigure open={open} className="absolute bottom-0 left-1/2 h-[58%] -translate-x-1/2" />

      <ThoughtCanvas items={open ? items : []} lg={lg} profile={profile} mx={mx} my={my} />

      {overlay && <div className="absolute inset-0 z-50">{overlay}</div>}
    </div>
  );
}
