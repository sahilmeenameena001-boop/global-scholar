/**
 * Head media manifest.
 *
 * Every visual state inside the head has a key — the same key as its drawn
 * world in `lib/journey/worlds.ts`. To replace a drawn state with produced
 * footage (Canva, Higgsfield…), drop files named after its key into
 * `public/global-scholar/head/`:
 *
 *   <key>.webm / <key>.mp4             the clip (WebM preferred, MP4 fallback)
 *   <key>-mobile.webm / -mobile.mp4    optional smaller clip for phones
 *   <key>-poster.webp|jpg              still shown while loading or on failure
 *   <key>.webp|jpg|png                 a still image instead of a clip
 *
 * Files are found when the site builds; nothing else needs to change. Any key
 * without media keeps its drawn world, so the journey never depends on assets.
 */

export const HEAD_MEDIA_DIR = "global-scholar/head";

/** The keys worth producing first, grouped as the journey uses them. */
export const mediaManifest = {
  hero: {
    /** The opening film itself lives in `journeyIntro.video`; these play inside its head. */
    exploring: { hover: "overload", courses: ["d-business", "d-technology", "d-engineering", "d-law", "d-medicine", "d-design"], destinations: ["p-uk", "p-usa", "p-canada", "p-australia", "p-europe", "decide"], intake: "timeline", priorities: "priorities", result: "result" },
    shortlisting: { hover: "shortlisting", steps: ["too-many", "countries", "fit", "uni-priorities", "buckets", "compare", "finalise"] },
    applying: { hover: "applying", steps: ["apps", "tracker", "pending", "deadlines", "dashboard", "next"] },
    offer: { hover: "offer", steps: ["offers", "acceptance", "visa", "funding", "move", "ready"] },
  },
} as const;
