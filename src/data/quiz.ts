export type QuizStep = { id: string; question: string; hint: string; options: string[]; multi?: boolean };

export const quizSteps: QuizStep[] = [
  { id: "field", question: "What do you want to study?", hint: "Pick the area closest to your interest.", options: ["Business & Management", "Engineering & Technology", "Computer Science & Data", "Health & Life Sciences", "Arts, Design & Media", "Law & Social Sciences"] },
  { id: "qualification", question: "What is your current qualification?", hint: "Your highest completed or in-progress level.", options: ["High school (12th grade)", "Diploma", "Bachelor's degree", "Master's degree"] },
  { id: "score", question: "What is your approximate academic score?", hint: "An estimate is fine for this first check.", options: ["Below 55%", "55% – 65%", "65% – 75%", "75% – 85%", "Above 85%"] },
  { id: "budget", question: "What is your annual study budget?", hint: "Tuition only, before scholarships.", options: ["Under USD 10,000", "USD 10,000 – 20,000", "USD 20,000 – 35,000", "Above USD 35,000"] },
  { id: "destinations", question: "Which destinations interest you?", hint: "Choose one or more.", multi: true, options: ["United Kingdom", "Canada", "Australia", "United States", "Germany", "Not sure yet"] },
];

export type UniversityMatch = {
  name: string;
  country: string;
  course: string;
  match: number;
  tuition: string;
  scholarship: string;
  reason: string;
};

/** Illustrative demo results. A real matching API can replace this. */
export const demoMatches: UniversityMatch[] = [
  { name: "Northbridge University", country: "United Kingdom", course: "MSc Business Analytics", match: 92, tuition: "£18,000 – £22,000", scholarship: "Up to 30% merit award", reason: "One-year format fits your budget and score band, with a strong analytics track." },
  { name: "Lakeshore Institute of Technology", country: "Canada", course: "MEng Software Systems", match: 87, tuition: "CAD 24,000 – 28,000", scholarship: "Entrance award possible", reason: "Co-op placements match your career focus and offer post-study work routes." },
  { name: "Coastal Pacific University", country: "Australia", course: "Master of Information Technology", match: 81, tuition: "AUD 30,000 – 34,000", scholarship: "Partial fee waiver possible", reason: "Flexible intakes and a practical curriculum suited to your qualification level." },
];
