/**
 * Mutable scene state. Written by ScrollTrigger, read inside useFrame.
 * Deliberately NOT React state — driving R3F transforms through state
 * would re-render the tree every frame.
 */
export const scene = {
  /** 0–1 across the whole document */
  progress: 0,
  /** index of the chapter currently owning the scene */
  target: 0,
  /** normalised pointer, -1..1 */
  px: 0,
  py: 0,
  /** impulse added to the field's spin by a deck swipe; decays back to zero */
  spin: 0,
};

/** Push a swipe into the background field. Clamped so repeated flicks cannot wind it up. */
export function nudgeScene(amount: number) {
  scene.spin = Math.max(-1.6, Math.min(1.6, scene.spin + amount));
}

export const CHAPTER_COUNT = 6;
