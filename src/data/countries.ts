export type Country = {
  id: string;
  name: string;
  code: string;
  tagline: string;
  duration: string;
  intake: string;
  tuition: string;
  subjects: string[];
  scholarships: string;
  accent: string;
  landmark: "bigben" | "cntower" | "opera" | "liberty" | "gate";
};

/** Illustrative demo data. Replace with a real content source before production. */
export const countries: Country[] = [
  { id: "uk", name: "United Kingdom", code: "UK", tagline: "One-year master's and historic universities", duration: "1-year master's, 3-year bachelor's", intake: "September, January", tuition: "£16,000 – £30,000", subjects: ["Business", "Law", "Engineering", "Data Science"], scholarships: "Widely available, merit-based", accent: "#2457F5", landmark: "bigben" },
  { id: "ca", name: "Canada", code: "CA", tagline: "Co-op programmes and post-study work routes", duration: "1–2-year master's, 4-year bachelor's", intake: "September, January, May", tuition: "CAD 20,000 – 40,000", subjects: ["Computer Science", "Nursing", "Business", "Environment"], scholarships: "Moderate, entrance awards common", accent: "#F06B5D", landmark: "cntower" },
  { id: "au", name: "Australia", code: "AU", tagline: "Research strength and outdoor campus life", duration: "1.5–2-year master's, 3-year bachelor's", intake: "February, July", tuition: "AUD 25,000 – 45,000", subjects: ["Health Sciences", "Engineering", "IT", "Hospitality"], scholarships: "Available, often partial fee waivers", accent: "#0B1F3A", landmark: "opera" },
  { id: "us", name: "United States", code: "US", tagline: "Flexible majors and the widest choice", duration: "2-year master's, 4-year bachelor's", intake: "August, January", tuition: "USD 25,000 – 55,000", subjects: ["STEM", "Business", "Liberal Arts", "Design"], scholarships: "Strong for high achievers, assistantships", accent: "#2457F5", landmark: "liberty" },
  { id: "de", name: "Germany", code: "DE", tagline: "Low tuition and engineering excellence", duration: "2-year master's, 3-year bachelor's", intake: "October, April", tuition: "€0 – €3,000 (public)", subjects: ["Engineering", "Automotive", "Physics", "Economics"], scholarships: "DAAD-style funding, competitive", accent: "#F06B5D", landmark: "gate" },
];
