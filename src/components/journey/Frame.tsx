/**
 * Grid slots around the persistent head. `ScholarJourney` lays out the grid;
 * each stage renders into these areas, so the scene never remounts.
 *
 *   mobile            desktop
 *   head              scene │ ·
 *   scene             scene │ head
 *   controls          scene │ controls
 *   wide              wide  ─ wide
 *
 * Columns are `minmax(0, …)` so a wide child (the swipe row of cards) scrolls
 * inside its slot instead of stretching the page past the viewport.
 */
export const FRAME_GRID =
  "grid grid-cols-[minmax(0,1fr)] gap-y-6 [grid-template-areas:'head'_'scene'_'controls'_'wide'] " +
  "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-[1fr_auto_auto_1fr_auto] lg:gap-x-12 " +
  "lg:[grid-template-areas:'scene_.'_'scene_head'_'scene_controls'_'scene_.'_'wide_wide']";

export function JourneyHead({ children }: { children: React.ReactNode }) {
  return <div className="[grid-area:head]">{children}</div>;
}

export function JourneyControls({ children }: { children: React.ReactNode }) {
  return <div className="[grid-area:controls]">{children}</div>;
}

export function JourneyWide({ children }: { children: React.ReactNode }) {
  return <div className="[grid-area:wide] lg:pt-6">{children}</div>;
}

/** The small uppercase line above a prompt. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-royal-lit">{children}</p>;
}

/** The handwritten aside under a prompt. */
export function Aside({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 font-hand text-xl leading-tight text-mist">{children}</p>;
}
