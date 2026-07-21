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
    skillTitle: "Counting Board",
    skillDescription: "Drag and count objects on the board — early number sense like classroom manipulatives.",
    gameType: "manipulative-board",
    duration: "3–5 min",
  },
  {
    slug: "grade-1",
    label: "Grade 1",
    band: "early",
    emoji: "📖",
    skillTitle: "Letter Count Board",
    skillDescription: "Build sight words by counting letter groups on the manipulative board.",
    gameType: "manipulative-board",
    duration: "3–5 min",
  },
  {
    slug: "grade-2",
    label: "Grade 2",
    band: "early",
    emoji: "➕",
    skillTitle: "Counter Addition",
    skillDescription: "Model addition and subtraction with counters before you calculate.",
    gameType: "manipulative-board",
    duration: "4–6 min",
  },
  {
    slug: "grade-3",
    label: "Grade 3",
    band: "elementary",
    emoji: "✖️",
    skillTitle: "Equal Groups Board",
    skillDescription: "Show multiplication as equal groups using the hands-on board.",
    gameType: "manipulative-board",
    duration: "4–6 min",
  },
  {
    slug: "grade-4",
    label: "Grade 4",
    band: "elementary",
    emoji: "✍️",
    skillTitle: "Writing Planner Intake",
    skillDescription: "Plan a strong paragraph on a structured writing intake form — hands-on prewriting workspace.",
    gameType: "intake-form-workspace",
    duration: "5–8 min",
  },
  {
    slug: "grade-5",
    label: "Grade 5",
    band: "elementary",
    emoji: "🍕",
    skillTitle: "Fraction Simulator",
    skillDescription: "Adjust numerator and denominator on a live bar model — see fractions as percentages.",
    gameType: "sim-canvas-workspace",
    duration: "5–8 min",
  },
  {
    slug: "grade-6",
    label: "Grade 6",
    band: "middle",
    emoji: "🌍",
    skillTitle: "Earth Science Variables",
    skillDescription: "Manipulate weather variables and read the graph — inquiry-based earth science.",
    gameType: "sim-canvas-workspace",
    duration: "5–8 min",
  },
  {
    slug: "grade-7",
    label: "Grade 7",
    band: "middle",
    emoji: "📐",
    skillTitle: "Ratio Graph Lab",
    skillDescription: "Explore unit rates on an interactive graph — change slope and read values.",
    gameType: "sim-canvas-workspace",
    duration: "5–8 min",
  },
  {
    slug: "grade-8",
    label: "Grade 8",
    band: "middle",
    emoji: "🔬",
    skillTitle: "Science Lab Bench",
    skillDescription: "Run a microscope lab procedure step by step — proper technique checkpoints.",
    gameType: "lab-bench-workspace",
    duration: "6–10 min",
  },
  {
    slug: "grade-9",
    label: "Grade 9",
    band: "high",
    emoji: "📈",
    skillTitle: "Algebra Graph Lab",
    skillDescription: "Adjust slope and intercept on a live graph — solve linear equations visually.",
    gameType: "sim-canvas-workspace",
    duration: "5–8 min",
  },
  {
    slug: "grade-10",
    label: "Grade 10",
    band: "high",
    emoji: "🔍",
    skillTitle: "Research Intake Form",
    skillDescription: "Complete a research project intake — thesis, sources, and database checklist.",
    gameType: "intake-form-workspace",
    duration: "6–10 min",
  },
  {
    slug: "grade-11",
    label: "Grade 11",
    band: "high",
    emoji: "📊",
    skillTitle: "Projectile Motion Sim",
    skillDescription: "Launch angle and velocity simulation — connects quadratics to physics.",
    gameType: "sim-canvas-workspace",
    duration: "6–10 min",
  },
  {
    slug: "grade-12",
    label: "Grade 12",
    band: "high",
    emoji: "🎓",
    skillTitle: "College Application Tracker",
    skillDescription: "Complete a senior-year college planning intake — deadlines, FAFSA, and recommendations.",
    gameType: "intake-form-workspace",
    duration: "6–10 min",
  },
  {
    slug: "college",
    label: "College",
    band: "post",
    emoji: "🏛️",
    skillTitle: "Research Data Sheet",
    skillDescription: "Track survey data and compute averages in a spreadsheet — college-level analysis.",
    gameType: "spreadsheet-workspace",
    duration: "8–12 min",
  },
  {
    slug: "trade-school",
    label: "Trade School · Math",
    band: "post",
    emoji: "🔧",
    skillTitle: "Jobsite Cut List",
    skillDescription:
      "Calculate stud counts and cut lengths on a jobsite — tape measure math trades use daily.",
    gameType: "jobsite-workspace",
    duration: "6–10 min",
  },
  {
    slug: "trade-school-vocabulary",
    label: "Trade School · Vocabulary",
    band: "post",
    emoji: "🧰",
    skillTitle: "Shop Tool ID Board",
    skillDescription: "Identify trade tools on a hands-on board — vocabulary through manipulation, not flashcards alone.",
    gameType: "manipulative-board",
    duration: "4–6 min",
  },
];

export function getEducationLevelBySlug(slug: string): EducationLevelEntry | undefined {
  return EDUCATION_LEVEL_GAMES.find((g) => g.slug === slug);
}

/** Match a curriculum subject/label to a school lab entry. */
export function getEducationLevelByLabel(
  name: string,
): EducationLevelEntry | undefined {
  const needle = name.trim().toLowerCase();
  if (!needle) return undefined;
  return EDUCATION_LEVEL_GAMES.find((g) => g.label.toLowerCase() === needle);
}

export function eduSkillGameId(slug: EducationLevelSlug): string {
  return `edu-skill-${slug}`;
}
