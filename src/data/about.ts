/**
 * Copy for the About page.
 *
 * Global Scholars is a fictional consultancy built for this demo. Nothing here
 * describes a real company, and none of it may be reworded into an outcome
 * guarantee — see the content-integrity rules in AGENTS.md.
 */

export const aboutIntro = {
  lede: "We are a small, independent counselling team. We are not a university agent and we are not paid to fill seats, so the shortlist you get is the one we would give a friend.",
  body: [
    "Most students arrive with the same three questions: which country, which course, and can I afford it. Answering them well takes an honest look at your academics, your budget and the deadlines you are actually able to meet — not a brochure.",
    "So we start with an assessment, say plainly what is realistic, and then work the applications with you from statement drafts to the pre-departure briefing. One counsellor stays with you the whole way.",
  ],
};

export type Principle = { title: string; text: string };

export const principles: Principle[] = [
  { title: "Independent by design", text: "We are paid by students, never by institutions, so no university buys its way onto your shortlist." },
  { title: "Honest before optimistic", text: "If a target is out of reach on your current profile we say so early, while there is still time to change the plan." },
  { title: "One counsellor, start to finish", text: "The person who assesses your profile is the person who checks your visa documents. Nothing is handed off mid-application." },
  { title: "No outcome promises", text: "Admission, funding and visas are decided by universities and authorities. We prepare the strongest case we can and never guarantee the result." },
];

export type Stat = { value: string; label: string };

/** Illustrative demo figures for a consultancy that does not exist. */
export const aboutStats: Stat[] = [
  { value: "5", label: "Destination countries advised on" },
  { value: "3", label: "Counsellors on the team" },
  { value: "6", label: "Stages in the application route" },
  { value: "Free", label: "First consultation, no obligation" },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  { q: "What does the first consultation cover?", a: "A counsellor reviews your academics, budget and timeline, tells you which destinations are realistic, and sets out what the application would involve. It is free and there is no obligation to continue." },
  { q: "Do you guarantee admission or a visa?", a: "No. Universities decide admissions and scholarships, and visa decisions rest with the relevant authorities. Anyone promising you a guaranteed outcome is not being straight with you." },
  { q: "Are you an agent for particular universities?", a: "No. We take no commission from institutions, which is why the shortlist is built around your profile rather than a partner list." },
  { q: "What happens to the details I submit here?", a: "They are used to arrange the counselling session you asked for and nothing else. This demo build records enquiries in a server log rather than a CRM — see the Privacy Policy in the footer." },
];
