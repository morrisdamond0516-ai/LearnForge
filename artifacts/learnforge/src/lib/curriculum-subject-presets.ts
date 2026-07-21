import { CAREER_OPTIONS } from "@/lib/careers";
import { EDUCATION_LEVEL_GAMES } from "@/lib/educational-games/education-levels-catalog";
import { SUBJECT_SIMULATIONS } from "@/lib/educational-games/subject-sims-catalog";

/** Shown first in Curriculum — tech & data paths learners ask for most. */
export const CURRICULUM_FEATURED_CAREERS: readonly string[] = [
  "Software Developer / Coding",
  "Data Analyst",
  "Information Technology",
  "IT Support / CompTIA A+",
  "Registered Nurse (NCLEX-RN)",
  "Cybersecurity Analyst (Security+)",
  "Cloud Computing (AWS / Azure)",
];

/** All built-in careers for curriculum (matches Career Skills Lab). */
export const CURRICULUM_CAREER_PRESETS: readonly string[] = CAREER_OPTIONS;

export const CURRICULUM_SCHOOL_PRESETS: readonly string[] =
  EDUCATION_LEVEL_GAMES.map((l) => l.label);

export const CURRICULUM_STEM_PRESETS: readonly string[] = Array.from(
  new Set(SUBJECT_SIMULATIONS.map((s) => s.subject)),
);

export const CURRICULUM_GENERAL_PRESETS: readonly string[] = [
  "Mathematics",
  "Geometry",
  "English / Language Arts",
  "Reading",
  "Writing",
  "History",
  "Geography",
  "Computer Science",
  "Spanish",
  "French",
  "Study Skills",
  "Test Prep (SAT / ACT)",
];

/** @deprecated Use grouped presets above — flat list for backwards compatibility */
export const CURRICULUM_SUBJECT_PRESETS: string[] = Array.from(
  new Set([
    ...CURRICULUM_CAREER_PRESETS,
    ...CURRICULUM_SCHOOL_PRESETS,
    ...CURRICULUM_STEM_PRESETS,
    ...CURRICULUM_GENERAL_PRESETS,
  ]),
).sort((a, b) => a.localeCompare(b));

export function curriculumPresetGroups(savedNames: Set<string>) {
  const skip = (name: string) => savedNames.has(name.toLowerCase());
  const featuredSet = new Set<string>(CURRICULUM_FEATURED_CAREERS);
  const featured = CURRICULUM_FEATURED_CAREERS.filter((n) => !skip(n));
  const otherCareers = CURRICULUM_CAREER_PRESETS.filter(
    (n) => !skip(n) && !featuredSet.has(n),
  );
  const school = CURRICULUM_SCHOOL_PRESETS.filter((n) => !skip(n));
  const stem = CURRICULUM_STEM_PRESETS.filter((n) => !skip(n));
  const general = CURRICULUM_GENERAL_PRESETS.filter((n) => !skip(n));
  return { featured, otherCareers, school, stem, general };
}
