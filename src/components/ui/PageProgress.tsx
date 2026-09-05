"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useSyncExternalStore } from "react";

const subscribeLoad = (cb: () => void) => {
  window.addEventListener("load", cb);
  return () => window.removeEventListener("load", cb);
};

/**
 * Royal-blue page-load bar. Creeps to 70% while the document is still loading,
 * snaps to full on `load`, then retires. Pure scaleX, never width.
 */
export function PageProgress() {
  const reduce = useReducedMotion();
  const done = useSyncExternalStore(subscribeLoad, () => document.readyState === "complete", () => false);
  const [gone, setGone] = useState(false);

  if (reduce || gone) return null;

  return (
    <AnimatePresence onExitComplete={() => setGone(true)}>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 origin-left bg-royal"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: done ? 1 : 0.7, opacity: done ? 0 : 1 }}
        transition={{
          scaleX: { duration: done ? 0.3 : 1.9, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.32, delay: done ? 0.3 : 0, ease: [0.22, 1, 0.36, 1] },
        }}
        onAnimationComplete={() => { if (done) setGone(true); }}
      />
    </AnimatePresence>
  );
}
