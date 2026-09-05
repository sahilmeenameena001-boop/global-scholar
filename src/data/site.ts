/**
 * Single source of truth for brand, contact and social details.
 *
 * Everything here is placeholder data for the demo build. Replace the values
 * with the real ones before launch — `contact.demo` drives the notice shown
 * beside the details, and any social entry left at `href: null` is omitted from
 * the footer rather than rendered as a dead link.
 */

export const brand = {
  name: "Global Scholars",
  tagline:
    "Independent study-abroad counselling that helps students choose the right country, course and university with honest, personalised guidance.",
};

export const contact = {
  /** Set to false once the details below are real. */
  demo: true,
  email: "hello@globalscholars.example",
  phone: "+91 00000 00000",
  /** Digits only, for the tel: href. */
  phoneHref: "+910000000000",
  address: "Demo office address, Your City",
};

export type Social = { name: string; icon: "instagram" | "linkedin" | "youtube"; href: string | null };

/** Fill in `href` to publish a profile; null entries stay hidden. */
export const socials: Social[] = [
  { name: "Instagram", icon: "instagram", href: null },
  { name: "LinkedIn", icon: "linkedin", href: null },
  { name: "YouTube", icon: "youtube", href: null },
];

export const activeSocials = socials.filter((s): s is Social & { href: string } => !!s.href);
