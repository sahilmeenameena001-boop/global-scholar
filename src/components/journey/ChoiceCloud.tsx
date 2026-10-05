"use client";
import { FloatingCTA } from "./FloatingCTA";

/** A loose, hand-placed scatter — never a straight grid of form buttons. */
const TILTS = [-2.5, 1.5, -1, 2.5, -1.8, 1, -0.6, 2];

export type CloudOption = { id: string; label: string; icon?: string };

/**
 * A cloud of sticker tags to pick from. Each is a toggle button (`aria-pressed`)
 * inside a labelled group. With `max`, tags beyond the limit stay focusable but
 * muted, so pressing one can explain why instead of silently doing nothing.
 */
export function ChoiceCloud({
  labelledBy, options, selected, onToggle, max,
}: {
  labelledBy: string;
  options: CloudOption[];
  selected: string[];
  onToggle: (id: string) => void;
  max?: number;
}) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-2.5">
      {options.map((o, i) => {
        const on = selected.includes(o.id);
        return (
          <FloatingCTA
            key={o.id}
            label={o.label}
            icon={o.icon}
            selected={on}
            muted={!!max && !on && selected.length >= max}
            tilt={TILTS[i % TILTS.length]}
            index={i}
            onClick={() => onToggle(o.id)}
          />
        );
      })}
    </div>
  );
}
