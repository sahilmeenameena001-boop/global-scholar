/**
 * Generated portrait illustrations.
 *
 * Every student and counsellor on this site is invented, so shipping stock
 * photography of real people would misrepresent them. These portraits are drawn
 * from the person's own name instead: the name is hashed once and the hash picks
 * the hair shape, tones and accessory, so a given profile always renders the
 * same face without any image file, network request or layout shift.
 *
 * The style is deliberately flat and illustrative — it must never be mistaken
 * for a photograph of a real student.
 */

const SKIN = ["#f1c9a5", "#e0a877", "#c98a5b", "#a96b41", "#7d4c2e", "#5f3a24"];
const HAIR = ["#191720", "#2f2118", "#4a2d1c", "#6b3f22", "#232a38", "#0f0f14"];
const GARMENT = ["#1d3468", "#243c4f", "#3a2b4d", "#123a3a", "#452431", "#1b2f45"];

/** FNV-1a: small, stable across runs, and good enough to spread names over the variants. */
function hash(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Hair is the strongest silhouette cue, so it carries most of the variation. */
const HAIR_SHAPES = [
  // cropped
  "M31 45 q0 -21 19 -21 q19 0 19 21 q-4 -11 -19 -11 q-15 0 -19 11 Z",
  // long, falling past the jaw
  "M29 46 q0 -23 21 -23 q21 0 21 23 v22 q-5 3 -7 -2 l-2 -21 q-12 6 -24 0 l-2 21 q-2 5 -7 2 Z",
  // tied back with a bun
  "M31 44 q0 -20 19 -20 q19 0 19 20 q-5 -10 -19 -10 q-14 0 -19 10 Z M69 30 a7 7 0 1 0 0.1 0 Z",
  // curls
  "M30 45 q-1 -22 20 -22 q21 0 20 22 q-3 -6 -8 -4 q-2 -7 -9 -5 q-4 -6 -11 -2 q-7 -2 -8 6 q-3 -1 -4 5 Z",
  // side part
  "M30 46 q0 -22 20 -22 q20 0 20 22 q-6 -13 -25 -8 q-9 2 -15 8 Z",
  // headwrap
  "M29 46 q0 -23 21 -23 q21 0 21 23 q-6 -6 -21 -6 q-15 0 -21 6 Z M29 46 q10 5 21 5 q11 0 21 -5 v5 q-10 6 -21 6 q-11 0 -21 -6 Z",
];

type Props = {
  /** Seeds the illustration; the same name always draws the same portrait. */
  name: string;
  /** Accent colour for the backdrop, taken from the person's profile. */
  colour: string;
  className?: string;
  /** Set when a caption already names the person, so the image is decorative. */
  decorative?: boolean;
};

export function PortraitArt({ name, colour, className = "size-14", decorative = false }: Props) {
  const h = hash(name);
  const skin = SKIN[h % SKIN.length];
  const hair = HAIR[(h >> 3) % HAIR.length];
  const garment = GARMENT[(h >> 6) % GARMENT.length];
  const shape = HAIR_SHAPES[(h >> 9) % HAIR_SHAPES.length];
  const glasses = ((h >> 13) & 3) === 0;
  const gid = `pa-${h.toString(36)}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} shrink-0 rounded-full`}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": `Illustrated portrait of ${name}, a fictional profile` })}
    >
      <defs>
        <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colour} stopOpacity="0.95" />
          <stop offset="100%" stopColor={colour} stopOpacity="0.45" />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${gid}-clip)`}>
        <rect width="100" height="100" fill={`url(#${gid}-bg)`} />
        {/* horizon arc lifts the head off a flat disc */}
        <circle cx="50" cy="96" r="42" fill="#ffffff" opacity="0.12" />

        {/* shoulders */}
        <path d="M16 100 q3 -25 34 -25 q31 0 34 25 Z" fill={garment} />
        <path d="M50 75 q-7 8 -7 25 h14 q0 -17 -7 -25 Z" fill="#ffffff" opacity="0.16" />

        {/* neck and head */}
        <path d="M43 62 h14 v13 q-7 5 -14 0 Z" fill={skin} />
        <path d="M43 68 q7 5 14 0 v3 q-7 5 -14 0 Z" fill="#000000" opacity="0.14" />
        <ellipse cx="50" cy="46" rx="18" ry="21" fill={skin} />
        <ellipse cx="31.5" cy="49" rx="3" ry="4" fill={skin} />
        <ellipse cx="68.5" cy="49" rx="3" ry="4" fill={skin} />

        {/* features, kept minimal so the drawing stays a drawing */}
        <ellipse cx="43" cy="47" rx="1.7" ry="2.1" fill="#1b1520" />
        <ellipse cx="57" cy="47" rx="1.7" ry="2.1" fill="#1b1520" />
        <path d="M39.5 41.5 q3.5 -2.5 7 -0.5 M53.5 41 q3.5 -2 7 0.5" fill="none" stroke={hair} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M49 50 v4 q0 1.5 2 1.5" fill="none" stroke="#000000" strokeOpacity="0.2" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M45 58 q5 3.5 10 0" fill="none" stroke="#8d4a3f" strokeWidth="1.8" strokeLinecap="round" />

        {glasses && (
          <g fill="none" stroke="#0f1420" strokeOpacity="0.75" strokeWidth="1.5">
            <rect x="37" y="43" width="12" height="9" rx="4" />
            <rect x="51" y="43" width="12" height="9" rx="4" />
            <path d="M49 47.5 h2 M37 46 l-4 -1 M63 46 l4 -1" strokeLinecap="round" />
          </g>
        )}

        <path d={shape} fill={hair} />
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2" />
    </svg>
  );
}
