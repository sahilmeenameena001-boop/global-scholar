"use client";
import type { Preview } from "@/lib/journey/worlds";
import { FloatingCTA } from "./FloatingCTA";

const TILTS = [-2.5, 1.5, -1, 2.5, -1.8, 1, -0.6, 2];

/** One option: previews in the thought panel on hover or focus, picks on click. Shared by every funnel. */
export function Choice({ label, i, on, icon, muted, preview, onPreview, onPick }: {
  label: string; i: number; on: boolean; icon?: string; muted?: boolean;
  /** What to show in the thought panel while hovered or focused. Optional: not every choice has a world. */
  preview?: Preview; onPreview?: (p: Preview | null) => void; onPick: () => void;
}) {
  return (
    <FloatingCTA
      label={label}
      icon={icon}
      selected={on}
      muted={muted}
      tilt={TILTS[i % TILTS.length]}
      index={i}
      onClick={onPick}
      onIntent={preview && onPreview ? () => onPreview(preview) : undefined}
      onLeave={preview && onPreview ? () => onPreview(null) : undefined}
      className="min-h-11 text-[13px] sm:text-sm"
    />
  );
}

