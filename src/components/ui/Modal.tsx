"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

type Props = { open: boolean; onClose: () => void; title: string; children: React.ReactNode; gate?: boolean };

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, gate = false }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const first = panel.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const [a, z] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-navy/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="relative w-full max-w-lg"
            initial={reduce || !gate ? false : { clipPath: "inset(0% 50% 0% 50% round 24px)" }}
            animate={reduce || !gate ? {} : { clipPath: "inset(0% 0% 0% 0% round 24px)" }}
            transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
          >
          {/* boarding-gate doors part to reveal the panel */}
          {gate && !reduce && [-1, 1].map((side) => (
            <motion.span
              key={side}
              aria-hidden
              className={`pointer-events-none absolute inset-y-0 z-10 w-1/2 bg-navy ${side < 0 ? "left-0 border-r border-royal/40" : "right-0"}`}
              initial={{ x: "0%" }}
              animate={{ x: `${side * 100}%` }}
              exit={{ x: "0%" }}
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
          <motion.div
            ref={panel}
            role="dialog" aria-modal="true" aria-labelledby={titleId}
            className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-lift sm:rounded-3xl sm:p-8"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h3 id={titleId} className="text-2xl text-ivory">{title}</h3>
              <button type="button" onClick={onClose} aria-label="Close dialog" className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-white/5">
                <X aria-hidden className="size-5" />
              </button>
            </div>
            {children}
          </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
