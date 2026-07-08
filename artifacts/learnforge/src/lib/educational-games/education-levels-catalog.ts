import type { SkillGameType } from "./skill-game-types";

export type EducationBand = "early" | "elementary" | "middle" | "high" | "post";

export type EducationLevelSlug =
  | "kindergarten"
  | "grade-1"
  | "grade-2"
  | "grade-3"
  | "grade-4"
  | "grade-5"
  | "grade-6"
  | "grade-7"
  | "grade-8"
  | "grade-9"
  | "grade-10"
  | "grade-11"
  | "grade-12"
  | "college"
  | "trade-school"
  | "trade-school-vocabulary";

export type EducationLevelEntry = {
  slug: EducationLevelSlug;
  label: string;
  band: EducationBand;
  emoji: string;
  skillTitle: string;
  skillDescription: string;
  gameType: SkillGameType;
  duration: string;
};

export const EDUCATION_BAND_LABELS: Record<EducationBand, string> = {
  early: "Early learning (K–2)",
  elementary: "Elementary (3–5)",
  middle: "Middle school (6–8)",
  high: "High school (9–12)",
  post: "College & trade school",
};

export const EDUCATION_LEVEL_GAMES: EducationLevelEntry[] = [
  {
    slug: "kindergarten",
    label: "Kindergarten",
    band: "early",
    emoji: "🎨",
    skillTitle: "Letters & Colors Match",
    skillDescription: "Match letters to sounds and colors to everyday objects — first reading and math skills.",
    gameType: "match-pairs",
    duration: "3–5 min",
  },
  {
    slug: "grade-1",
    label: "Grade 1",
    band: "early",
    emoji: "📖",
    skillTitle: "Sight Word Match",
    skillDescription: "Pair common sight words with simple pictures and meanings.",
    gameType: "match-pairs",
    duration: "3–5 min",
  },
  {
    slug: "grade-2",
    label: "Grade 2",
    band: "early",
    emoji: "➕",
    skillTitle: "Add & Subtract Lab",
    skillDescription: "Two-digit addition and subtraction word problems.",
    gameType: "math-scenario",
    duration: "4–6 min",
  },
  {
    slug: "grade-3",
    label: "Grade 3",
    band: "elementary",
    emoji: "✖️",
    skillTitle: "Multiplication Starter",
    skillDescription: "Times tables and equal-groups word problems.",
    gameType: "math-scenario",
    duration: "4–6 min",
  },
  {
    slug: "grade-4",
    label: "Grade 4",
    band: "elementary",
    emoji: "✍️",
    skillTitle: "Writing Process",
    skillDescription: "Put the steps of a strong paragraph in the correct order.",
    gameType: "sequence-build",
    duration: "4–6 min",
  },
  {
    slug: "grade-5",
    label: "Grade 5",
    band: "elementary",
    emoji: "🍕",
    skillTitle: "Fractions Kitchen",
    skillDescription: "Add fractions, compare sizes, and solve real-world fraction problems.",
    gameType: "math-scenario",
    duration: "5–8 min",
  },
  {
    slug: "grade-6",
    label: "Grade 6",
    band: "middle",
    emoji: "🌍",
    skillTitle: "Earth Science Match",
    skillDescription: "Match geology, weather, and ecosystem terms every sixth grader learns.",
    gameType: "match-pairs",
    duration: "4–6 min",
  },
  {
    slug: "grade-7",
    label: "Grade 7",
    band: "middle",
    emoji: "📐",
    skillTitle: "Ratio & Proportion Lab",
    skillDescription: "Scale drawings, unit rates, and percent problems.",
    gameType: "math-scenario",
    duration: "5–8 min",
  },
  {
    slug: "grade-8",
    label: "Grade 8",
    band: "middle",
    emoji: "🔬",
    skillTitle: "Lab Report Steps",
    skillDescription: "Sequence a middle-school science lab from hypothesis to conclusion.",
    gameType: "sequence-build",
    duration: "5–8 min",
  },
  {
    slug: "grade-9",
    label: "Grade 9",
    band: "high",
    emoji: "📈",
    skillTitle: "Algebra Equations",
    skillDescription: "Solve linear equations and translate words into algebra.",
    gameType: "math-scenario",
    duration: "5–8 min",
  },
  {
    slug: "grade-10",
    label: "Grade 10",
    band: "high",
    emoji: "🔍",
    skillTitle: "Research Skills",
    skillDescription: "Choose trustworthy sources and avoid plagiarism traps.",
    gameType: "script-choice",
    duration: "5–8 min",
  },
  {
    slug: "grade-11",
    label: "Grade 11",
    band: "high",
    emoji: "📊",
    skillTitle: "Advanced Math",
    skillDescription: "Quadratics, functions, and geometry reasoning for junior year.",
    gameType: "math-scenario",
    duration: "5–8 min",
  },
  {
    slug: "grade-12",
    label: "Grade 12",
    band: "high",
    emoji: "🎓",
    skillTitle: "College Ready Checklist",
    skillDescription: "Order the steps for applications, financial aid, and senior-year planning.",
    gameType: "sequence-build",
    duration: "5–8 min",
  },
  {
    slug: "college",
    label: "College",
    band: "post",
    emoji: "🏛️",
    skillTitle: "Academic Writing Lab",
    skillDescription: "Research workflow, citation order, and college-level typing practice.",
    gameType: "typing-drill",
    duration: "6–10 min",
  },
  {
    slug: "trade-school",
    label: "Trade School · Math",
    band: "post",
    emoji: "🔧",
    skillTitle: "Jobsite Measure Challenge",
    skillDescription:
      "Hands-on math practice — read tape measures, add cut lengths, compare fractions, and figure stud spacing. This is the calculation work you do on a real jobsite.",
    gameType: "math-scenario",
    duration: "5–8 min",
  },
  {
    slug: "trade-school-vocabulary",
    label: "Trade School · Vocabulary",
    band: "post",
    emoji: "🧰",
    skillTitle: "Shop Vocabulary Match",
    skillDescription:
      "Vocabulary drill — flip cards and match trade tools and terms to their definitions. This is flashcard-style memorization for shop talk (tape measure, PPE, stud spacing, etc.), not a simulation game.",
    gameType: "match-pairs",
    duration: "3–5 min",
  },
];

export function getEducationLevelBySlug(slug: string): EducationLevelEntry | undefined {
  return EDUCATION_LEVEL_GAMES.find((g) => g.slug === slug);
}

export function eduSkillGameId(slug: EducationLevelSlug): string {
  return `edu-skill-${slug}`;
}
