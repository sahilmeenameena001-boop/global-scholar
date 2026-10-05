"use client";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { forwardRef } from "react";
import { ICONS } from "./ThoughtArt";

type Tone = "ivory" | "sky" | "coral";

const NOTE: Record<Tone, string> = {
  ivory: "bg-ivory text-ink",
  sky: "bg-sky text-ink",
  coral: "bg-coral text-void",
};

type Props = {
  label: string;
  /** Small handwritten line above the label, e.g. "Dream". */
  kicker?: string;
  icon?: string;
  /** `note` is a taped paper thought; `tag` is a die-cut sticker chip. */
  variant?: "note" | "tag";
  tone?: Tone;
  /** Resting tilt in degrees. Selected objects straighten up. */
  tilt?: number;
  /** For toggles: rendered as `aria-pressed`. Leave undefined for plain actions. */
  selected?: boolean;
  /** Present but out of reach (e.g. a fourth priority) — still focusable, so the reason can be announced. */
  muted?: boolean;
  index?: number;
  onClick: () => void;
  /** Fired on hover or focus — used to preview a choice and warm the next scene's code. */
  onIntent?: () => void;
  /** Fired when hover or focus leaves. */
  onLeave?: () => void;
  /** A call to action that slides out of a note while it is `active` (hovered or focused). */
  hint?: string;
  active?: boolean;
  className?: string;
};

/**
 * A choice that lives inside the collage rather than in a form: a sticky note
 * or a sticker you pick off the page. Always a real `<button>`, at least 48px
 * tall, with a visible focus ring.
 */
export const FloatingCTA = forwardRef<HTMLButtonElement, Props>(function FloatingCTA(
  { label, kicker, icon, variant = "tag", tone = "ivory", tilt = 0, selected, muted, index = 0, onClick, onIntent, onLeave, hint, active, className = "" },
  ref,
) {
  const Icon = icon ? ICONS[icon] ?? Sparkles : null;
  const on = !!selected;

  const shell =
    variant === "note"
      ? `rounded-[4px] px-4 pb-3 pt-4 text-left shadow-lift ${NOTE[tone]}`
      : `rounded-full py-2.5 pl-3 pr-4 text-sm font-semibold shadow-card ring-1 ring-inset transition-colors duration-200 ${
          on ? "bg-royal text-white ring-royal-lit" : "bg-surface/85 text-ivory ring-white/15 backdrop-blur-sm hover:bg-raised hover:ring-white/30"
        }`;

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-pressed={selected === undefined ? undefined : on}
      aria-disabled={muted || undefined}
      onClick={onClick}
      onPointerEnter={onIntent}
      onFocus={onIntent}
      onPointerLeave={onLeave}
      onBlur={onLeave}
      initial={{ opacity: 0, y: 18, scale: 0.9, rotate: tilt * 2 }}
      animate={{ opacity: muted ? 0.45 : 1, y: 0, scale: on ? 1.04 : 1, rotate: on ? 0 : tilt }}
      whileHover={{ y: -3, rotate: on ? 0 : tilt * 0.4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 320, damping: 22, delay: index * 0.05, opacity: { duration: 0.3, delay: index * 0.05 } }}
      className={`group relative inline-flex min-h-12 cursor-pointer items-center gap-2 ${shell} ${className}`}
    >
      {variant === "note" && <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 -rotate-2 bg-royal-lit/40" />}

      {variant === "tag" && (
        <span aria-hidden className={`grid size-6 shrink-0 place-items-center rounded-full ${on ? "bg-white/20" : "bg-white/[0.06]"}`}>
          {on ? <Check className="size-3.5" strokeWidth={3} /> : Icon ? <Icon className="size-3.5 text-royal-lit" /> : <span className="size-1.5 rounded-full bg-faint" />}
        </span>
      )}

      <span className="block">
        {kicker && <span className="block font-hand text-base leading-none opacity-70">{kicker}</span>}
        <span className={variant === "note" ? "mt-0.5 block font-serif text-[1.05rem] font-semibold leading-tight lg:text-lg" : ""}>{label}</span>
        {hint && (
          <motion.span
            className="block overflow-hidden"
            initial={false}
            animate={{ height: active ? "auto" : 0, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mt-2 flex items-center gap-1.5 text-sm font-semibold underline decoration-2 underline-offset-4">
              {hint} <ArrowRight aria-hidden className="size-3.5" />
            </span>
          </motion.span>
        )}
      </span>
    </motion.button>
  );
});
