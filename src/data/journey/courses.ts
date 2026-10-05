import type { DisciplineId } from "@/lib/journey/types";

/**
 * Course families per discipline. Exploring shows them as "relevant course
 * types" on each direction card; the shortlisting flow will offer the same
 * list as the course-level choice after a discipline is picked.
 */
export const coursesByDiscipline: Record<DisciplineId, string[]> = {
  business: ["MSc Finance", "MSc Management", "MSc Marketing", "Business Analytics", "MBA"],
  technology: ["MSc Computer Science", "Data Science", "Artificial Intelligence", "Cyber Security"],
  engineering: ["Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Robotics"],
  law: ["LLM", "International Relations", "Economics", "Psychology"],
  medicine: ["Public Health", "Biotechnology", "Pharmacology", "Nursing"],
  design: ["UX & Interaction Design", "Architecture", "Fashion", "Film & Media"],
  undecided: ["Business", "Computing", "Engineering", "Health"],
};

/** Where a discipline can lead — previewed inside the head while a course is being chosen. */
export const careersByDiscipline: Record<DisciplineId, string[]> = {
  business: ["Consulting", "Finance", "Marketing"],
  technology: ["Software", "Data", "AI"],
  engineering: ["Energy", "Robotics", "Infrastructure"],
  law: ["Policy", "Law", "Research"],
  medicine: ["Healthcare", "Research", "Biotech"],
  design: ["UX", "Architecture", "Film"],
  undecided: ["Anything", "Everything", "Let’s find out"],
};
