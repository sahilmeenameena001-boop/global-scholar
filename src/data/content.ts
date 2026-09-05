export const journeySteps = [
  { title: "Profile assessment", text: "We review your academics, goals and budget to build an honest starting point.", stamp: "Assessed" },
  { title: "Country and course selection", text: "Shortlist destinations and programmes that genuinely fit, not just the famous names.", stamp: "Shortlisted" },
  { title: "University application", text: "Statement editing, document checks and deadline tracking for every application.", stamp: "Applied" },
  { title: "Scholarship and finance guidance", text: "Identify funding you may be eligible for and plan realistic finances.", stamp: "Funded" },
  { title: "Visa support", text: "Structured document preparation and interview practice for your student visa.", stamp: "Visa" },
  { title: "Pre-departure preparation", text: "Accommodation, banking, travel and settling-in briefings before you fly.", stamp: "Boarding" },
];

export type Scholarship = {
  id: number;
  name: string;
  provider: string;
  country: string;
  level: string;
  subject: string;
  award: string;
  deadline: string;
  status: "Open" | "Closing soon" | "Closed";
  eligibility: string;
};

/** Illustrative demo data. Verify with the provider before use. */
export const scholarships: Scholarship[] = [
  { id: 1, name: "Chancellor's International Excellence Award", provider: "Northbridge University", country: "United Kingdom", level: "Postgraduate", subject: "Business", award: "Up to £8,000 tuition reduction", deadline: "30 June 2027", status: "Open", eligibility: "International applicants holding an unconditional offer with strong academic results." },
  { id: 2, name: "Maple Leaf Entrance Scholarship", provider: "Lakeshore Institute of Technology", country: "Canada", level: "Undergraduate", subject: "Engineering", award: "CAD 5,000 – 10,000 per year", deadline: "15 March 2027", status: "Closing soon", eligibility: "First-year international students with an average of 85% or above." },
  { id: 3, name: "Pacific Research Fellowship", provider: "Coastal Pacific University", country: "Australia", level: "Postgraduate", subject: "Health Sciences", award: "Full tuition plus stipend", deadline: "31 October 2026", status: "Closed", eligibility: "Research master's or PhD applicants with a relevant first-class degree." },
  { id: 4, name: "Founders' Merit Scholarship", provider: "Redwood State University", country: "United States", level: "Undergraduate", subject: "Computer Science", award: "USD 12,000 per year", deadline: "1 December 2026", status: "Open", eligibility: "Applicants with a strong academic record and demonstrated leadership." },
  { id: 5, name: "Engineering Talent Grant", provider: "Rheinland Technical University", country: "Germany", level: "Postgraduate", subject: "Engineering", award: "€850 monthly living support", deadline: "15 January 2027", status: "Open", eligibility: "Master's applicants in engineering with above-average grades and B2 German or English." },
  { id: 6, name: "Creative Futures Bursary", provider: "Northbridge University", country: "United Kingdom", level: "Undergraduate", subject: "Arts & Design", award: "£3,000 one-off", deadline: "28 February 2027", status: "Closing soon", eligibility: "Portfolio-based applicants to creative programmes." },
];

export const scholarshipFilters = {
  country: ["All", "United Kingdom", "Canada", "Australia", "United States", "Germany"],
  level: ["All", "Undergraduate", "Postgraduate"],
  subject: ["All", "Business", "Engineering", "Computer Science", "Health Sciences", "Arts & Design"],
  status: ["All", "Open", "Closing soon", "Closed"],
};

export type Story = {
  name: string; initials: string; city: string; destination: string; university: string; course: string; scholarship: string; quote: string; colour: string;
};

/** Fictional demo stories in development. Replace with consented, verified student stories. */
export const stories: Story[] = [
  { name: "Aarav Mehta", initials: "AM", city: "Pune, India", destination: "Manchester, UK", university: "Northbridge University", course: "MSc Business Analytics", scholarship: "25% merit award", quote: "The shortlist was honest about my chances, which is exactly what I needed to decide with confidence.", colour: "#2457F5" },
  { name: "Sofia Nakamura", initials: "SN", city: "Colombo, Sri Lanka", destination: "Toronto, Canada", university: "Lakeshore Institute of Technology", course: "MEng Software Systems", scholarship: "Entrance award", quote: "From statement drafts to the visa interview, every step had a checklist and a person I could call.", colour: "#F06B5D" },
  { name: "Daniel Okafor", initials: "DO", city: "Lagos, Nigeria", destination: "Sydney, Australia", university: "Coastal Pacific University", course: "Master of Information Technology", scholarship: "Partial fee waiver", quote: "I nearly picked the wrong intake. The team caught it early and saved me six months.", colour: "#0B1F3A" },
];

export type Counsellor = {
  name: string; initials: string; countries: string[]; expertise: string[]; languages: string[]; years: number; colour: string;
};

/** Fictional counsellor profiles for demo purposes. */
export const counsellors: Counsellor[] = [
  { name: "Priya Raman", initials: "PR", countries: ["United Kingdom", "Ireland"], expertise: ["Postgraduate business", "Personal statements"], languages: ["English", "Hindi", "Tamil"], years: 9, colour: "#2457F5" },
  { name: "Marcus Lindqvist", initials: "ML", countries: ["Canada", "United States"], expertise: ["STEM admissions", "Scholarship strategy"], languages: ["English", "Swedish"], years: 12, colour: "#F06B5D" },
  { name: "Hana Yusuf", initials: "HY", countries: ["Australia", "Germany"], expertise: ["Visa preparation", "Health & engineering programmes"], languages: ["English", "Arabic", "German"], years: 7, colour: "#0B1F3A" },
];

export const navLinks = [
  { label: "Countries", href: "#countries" },
  { label: "Universities", href: "#quiz" },
  { label: "Scholarships", href: "#scholarships" },
  { label: "How It Works", href: "#journey" },
  { label: "Student Stories", href: "#stories" },
  { label: "About", href: "#about" },
];
