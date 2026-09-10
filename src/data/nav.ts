/**
 * The site map. Every navbar entry is a real route, and the home page renders a
 * teaser card per entry from this same list — so adding a page here adds it to
 * the header, the footer and the home grid at once.
 *
 * `index` is the chapter number shown in the opener of each page; keep the
 * sequence contiguous so the numbering reads as one story across the site.
 */

export type NavLink = {
  label: string;
  href: string;
  /** Chapter number shown by `ChapterHead` on the destination page. */
  index: string;
  eyebrow: string;
  /** One-line summary used on the home page teaser card. */
  blurb: string;
  /** One word for the chapter rail, where there is no room for the full label. */
  rail: string;
};

export const navLinks: NavLink[] = [
  {
    label: "About",
    href: "/about",
    index: "01",
    eyebrow: "Who we are",
    blurb: "An independent counselling team, and the way we work with students.",
    rail: "Who",
  },
  {
    label: "Countries",
    href: "/countries",
    index: "02",
    eyebrow: "Where",
    blurb: "Compare five destinations on duration, intake, tuition and funding.",
    rail: "Where",
  },
  {
    label: "Universities",
    href: "/universities",
    index: "03",
    eyebrow: "The match",
    blurb: "Five questions that turn your profile into a first shortlist.",
    rail: "Match",
  },
  {
    label: "Scholarships",
    href: "/scholarships",
    index: "04",
    eyebrow: "Funding",
    blurb: "Filter example awards by country, level and subject.",
    rail: "Funding",
  },
  {
    label: "How It Works",
    href: "/how-it-works",
    index: "05",
    eyebrow: "The route",
    blurb: "Six stages from first assessment to the day you fly.",
    rail: "Route",
  },
  {
    label: "Student Stories",
    href: "/stories",
    index: "06",
    eyebrow: "Arrivals",
    blurb: "Journeys that started with one honest conversation.",
    rail: "Arrivals",
  },
];

/** The rail also stops at the home page, which is not a nav link. */
export const railStops = [{ href: "/", rail: "Departure", label: "Home" }, ...navLinks.map((l) => ({ href: l.href, rail: l.rail, label: l.label }))];

/** Lookup used by each page to label its own opener. */
export const navByHref = Object.fromEntries(navLinks.map((l) => [l.href, l])) as Record<string, NavLink>;
