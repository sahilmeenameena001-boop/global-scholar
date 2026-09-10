"use client";
import { Headline } from "./anim";

/**
 * A narrative chapter. `n` tags the section for the WebGL field, which morphs
 * to that chapter's shape as it reaches the middle of the viewport.
 */
export function Chapter({
  n, id, children, className = "", full = false,
}: { n: number; id: string; children: React.ReactNode; className?: string; full?: boolean }) {
  return (
    <section
      id={id}
      data-chapter={n}
      className={`relative scroll-mt-24 px-5 py-28 sm:px-8 md:py-40 ${full ? "min-h-[100svh] flex items-center" : ""} ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

/** Asymmetric chapter opener: hung index in the margin, headline on the grid. */
export function ChapterHead({
  index, eyebrow, title, lede, className = "", id,
}: { index: string; eyebrow: string; title: string; lede?: string; className?: string; id?: string }) {
  return (
    <header className={`grid gap-x-8 gap-y-6 md:grid-cols-12 ${className}`}>
      <div className="flex items-start gap-4 md:col-span-3">
        <span aria-hidden className="font-serif text-sm tabular-nums text-royal-lit">{index}</span>
        <span aria-hidden className="mt-2 h-px flex-1 rule md:max-w-24" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-faint">{eyebrow}</p>
      </div>
      <div className="md:col-span-8 md:col-start-5">
        <Headline as="h2" id={id} className="text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.02] text-ivory">
          {title}
        </Headline>
        {lede && <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-mist">{lede}</p>}
      </div>
    </header>
  );
}
