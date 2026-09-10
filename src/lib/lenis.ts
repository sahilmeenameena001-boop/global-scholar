/** Lenis is mounted once in `SmoothScroll` and published on `window`, because
 *  scroll callers (anchors, route changes) sit outside its React subtree. */
export type LenisLike = {
  scrollTo: (target: number, options?: { offset?: number; duration?: number; immediate?: boolean }) => void;
};

/** Height of the fixed header, subtracted so anchored content clears it. */
export const HEADER_OFFSET = 88;

export const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

/** Document offset of an anchor target, already allowing for the header. */
export const anchorTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
