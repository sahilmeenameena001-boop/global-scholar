"use client";
import { Headline } from "./anim";

type Props = { eyebrow: string; title: string; text?: string; align?: "left" | "center"; light?: boolean };

/** Kept for compatibility with sections that still call it. */
export function SectionHeading({ eyebrow, title, text, align = "left" }: Props) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-royal-lit">{eyebrow}</p>
      <Headline as="h2" className="text-[clamp(1.85rem,4vw,3rem)] leading-[1.05] text-ivory">{title}</Headline>
      {text && <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-mist sm:text-lg">{text}</p>}
    </div>
  );
}

export function DemoBadge({ children = "Illustrative demo data" }: { children?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-coral/35 bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
      <span aria-hidden className="size-1.5 rounded-full bg-coral" />
      {children}
    </span>
  );
}
