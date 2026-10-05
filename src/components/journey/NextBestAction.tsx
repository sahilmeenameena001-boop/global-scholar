import { homeCopy } from "@/data/journey/home";
import type { NextBestAction as Action } from "@/lib/journey/nextBestAction";
import { Button } from "../ui/Button";

const URGENCY: Record<Action["urgency"], { label: string; cls: string }> = {
  urgent: { label: "Urgent", cls: "bg-coral text-void" },
  high: { label: "Soon", cls: "bg-coral/25 text-coral ring-1 ring-inset ring-coral/40" },
  medium: { label: "Next up", cls: "bg-royal/30 text-royal-lit ring-1 ring-inset ring-royal-lit/40" },
  low: { label: "When ready", cls: "bg-white/10 text-ivory/80 ring-1 ring-inset ring-white/20" },
};

/**
 * The one thing to do next — the most prominent element wherever it appears,
 * with a single primary button. Its content comes from
 * `calculateNextBestAction`; this only presents it.
 */
export function NextBestAction({ action, headingLevel = 2, onAction }: {
  action: Action;
  headingLevel?: 2 | 3;
  /** Act in place (e.g. jump to a step inside the head) instead of following the action's link. */
  onAction?: () => void;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const u = URGENCY[action.urgency];
  return (
    <article className="relative overflow-hidden rounded-3xl bg-ivory p-6 text-ink shadow-lift sm:p-8">
      <span aria-hidden className="absolute -top-2 left-10 h-4 w-16 -rotate-3 bg-royal-lit/40" />
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/60">{homeCopy.nextEyebrow}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${u.cls}`}>{u.label}</span>
      </div>
      <H className="mt-3 font-serif text-[clamp(1.5rem,3.6vw,2.25rem)] leading-tight">{action.title}</H>
      <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-ink/75">{action.description}</p>
      <div className="mt-6">
        {onAction
          ? <Button type="button" variant="coral" arrow onClick={onAction}>{action.cta}</Button>
          : <Button href={action.href} variant="coral" arrow>{action.cta}</Button>}
      </div>
    </article>
  );
}
