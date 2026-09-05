/**
 * Placeholder legal copy for the demo build.
 *
 * These are plain-language outlines, NOT legal advice and NOT a compliant
 * policy for a real consultancy. Replace every document with text reviewed by a
 * qualified adviser before this site handles real enquiries, and set
 * `LEGAL_IS_PLACEHOLDER` to false once that review is done — the notice at the
 * top of each document is driven by that flag.
 */

export const LEGAL_IS_PLACEHOLDER = true;

export type LegalDoc = {
  id: "privacy" | "terms" | "disclaimer";
  label: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
};

export const legalDocs: LegalDoc[] = [
  {
    id: "privacy",
    label: "Privacy Policy",
    title: "Privacy Policy",
    updated: "Draft — not yet reviewed",
    sections: [
      {
        heading: "What we collect",
        body: "When you request a counselling call we collect the name, email address, phone number and preferred contact time you enter in the form. We do not ask for academic transcripts, financial documents or identity documents through this website.",
      },
      {
        heading: "Why we collect it",
        body: "We use your details for one purpose: to contact you about the counselling session you asked for. We do not sell your details, and we do not pass them to universities or agents without asking you first.",
      },
      {
        heading: "How long we keep it",
        body: "Enquiry details are kept only as long as needed to respond to you and to keep a record of the advice given. You can ask us to delete your enquiry at any time.",
      },
      {
        heading: "Your choices",
        body: "You can ask for a copy of what we hold, ask us to correct it, or ask us to erase it. Write to the contact address in the footer and we will respond.",
      },
      {
        heading: "Cookies and analytics",
        body: "This demo build sets no advertising or tracking cookies. If analytics are added later, this section will name the provider and what it measures.",
      },
    ],
  },
  {
    id: "terms",
    label: "Terms",
    title: "Terms of Use",
    updated: "Draft — not yet reviewed",
    sections: [
      {
        heading: "What this site is",
        body: "This website describes a study-abroad counselling service and lets you request a call. Using it does not create a client relationship; that begins only under a separate written engagement.",
      },
      {
        heading: "What we provide",
        body: "Counselling, shortlisting and application guidance. We prepare and check applications with you — we do not make admission, funding or visa decisions, and we cannot influence the bodies that do.",
      },
      {
        heading: "Accuracy of information",
        body: "Course, tuition, scholarship and deadline information changes frequently and is reproduced here for illustration. Always confirm the current position with the university or authority before acting on it.",
      },
      {
        heading: "Your responsibilities",
        body: "The information you give us must be accurate and your own. Misrepresentation in an application is grounds for a university or visa authority to refuse or revoke a decision, and we will not submit an application we believe to be misleading.",
      },
      {
        heading: "Fees and cancellation",
        body: "The initial counselling call is free. Any paid service is quoted in writing beforehand, with its cancellation and refund terms stated at that point.",
      },
    ],
  },
  {
    id: "disclaimer",
    label: "Disclaimer",
    title: "Disclaimer",
    updated: "Draft — not yet reviewed",
    sections: [
      {
        heading: "Demonstration content",
        body: "Global Scholars is a fictional consultancy built to demonstrate this website. The universities, scholarships, award amounts, deadlines, student stories and counsellor profiles shown are invented and must not be relied on.",
      },
      {
        heading: "No guaranteed outcome",
        body: "No counselling service can guarantee admission, a scholarship or a visa. Those decisions rest entirely with the universities and government authorities concerned, and depend on your own eligibility and evidence.",
      },
      {
        heading: "Not professional advice",
        body: "Nothing here is legal, immigration or financial advice. Immigration rules and funding conditions differ by country and change without notice — check the official source for your destination.",
      },
      {
        heading: "External links",
        body: "Where this site links to a university, funder or government page, that content is theirs. We do not control it and are not responsible for its accuracy or availability.",
      },
    ],
  },
];
