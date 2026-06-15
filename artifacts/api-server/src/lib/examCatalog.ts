/**
 * Curated catalog of certified, full-length practice exams. These mirror real
 * high-school-equivalency, college-entrance, and trade/professional licensing
 * exams. Questions are AI-generated on demand (and regenerated on every take),
 * grounded by each exam's `careerContext`, which is passed to the quiz
 * generator as the `career` so the model writes in the style/difficulty of the
 * real exam.
 *
 * NOTE: generation is capped at MAX_QUIZ_QUESTIONS (60) per quiz, so an exam's
 * `questionCount` is the practice length we generate, not always the real
 * exam's full item count.
 */

export type ExamCategory = "high_school" | "college" | "trade";

export const CATEGORY_LABELS: Record<ExamCategory, string> = {
  high_school: "High School Equivalency",
  college: "College Entrance & Credit",
  trade: "Trade & Professional Certifications",
};

export const CATEGORY_ORDER: ExamCategory[] = [
  "high_school",
  "college",
  "trade",
];

/** Minimum score (percent) required to earn a certificate. */
export const EXAM_PASS_SCORE = 70;

/** How long an earned certificate stays valid before it auto-expires. */
export const CERT_VALID_DAYS = 90;

export interface CatalogExam {
  slug: string;
  name: string;
  category: ExamCategory;
  blurb: string;
  questionCount: number;
  durationMin: number;
  difficulty: string;
  /** Real exam/role context handed to the AI generator as `career`. */
  careerContext: string;
  /** Optional section focus (passed as `topic`). */
  focus?: string;
}

export const EXAM_CATALOG: CatalogExam[] = [
  // --- High school equivalency ---
  {
    slug: "ged",
    name: "GED",
    category: "high_school",
    blurb:
      "High school equivalency across reasoning through language arts, math, science, and social studies.",
    questionCount: 40,
    durationMin: 90,
    difficulty: "medium",
    careerContext: "GED high school equivalency exam",
  },
  {
    slug: "hiset",
    name: "HiSET",
    category: "high_school",
    blurb:
      "High school equivalency test covering language arts, math, science, and social studies.",
    questionCount: 40,
    durationMin: 90,
    difficulty: "medium",
    careerContext: "HiSET high school equivalency exam",
  },
  // --- College entrance & credit ---
  {
    slug: "sat",
    name: "SAT",
    category: "college",
    blurb:
      "College entrance exam: evidence-based reading & writing plus math.",
    questionCount: 44,
    durationMin: 100,
    difficulty: "hard",
    careerContext: "SAT college admissions exam",
    focus: "Reading & Writing and Math",
  },
  {
    slug: "act",
    name: "ACT",
    category: "college",
    blurb: "College entrance exam: English, math, reading, and science.",
    questionCount: 44,
    durationMin: 100,
    difficulty: "hard",
    careerContext: "ACT college admissions exam",
    focus: "English, Math, Reading, and Science",
  },
  {
    slug: "accuplacer",
    name: "ACCUPLACER",
    category: "college",
    blurb:
      "College placement test for reading, writing, and quantitative reasoning.",
    questionCount: 36,
    durationMin: 75,
    difficulty: "medium",
    careerContext: "ACCUPLACER college placement exam",
  },
  {
    slug: "clep-composition",
    name: "CLEP College Composition",
    category: "college",
    blurb: "Earn college credit by exam in writing and composition skills.",
    questionCount: 40,
    durationMin: 80,
    difficulty: "medium",
    careerContext: "CLEP College Composition credit-by-exam",
  },
  // --- Trade & professional certifications ---
  {
    slug: "comptia-a-plus",
    name: "CompTIA A+ (Core 1)",
    category: "trade",
    blurb:
      "Entry IT support certification: hardware, networking, mobile, and troubleshooting.",
    questionCount: 45,
    durationMin: 90,
    difficulty: "hard",
    careerContext: "CompTIA A+ Core 1 (220-1101) IT support certification exam",
  },
  {
    slug: "aws-cloud-practitioner",
    name: "AWS Certified Cloud Practitioner",
    category: "trade",
    blurb:
      "Foundational cloud certification: AWS concepts, security, billing, and core services.",
    questionCount: 45,
    durationMin: 90,
    difficulty: "hard",
    careerContext:
      "AWS Certified Cloud Practitioner (CLF-C02) certification exam",
  },
  {
    slug: "cdl-general",
    name: "CDL General Knowledge",
    category: "trade",
    blurb:
      "Commercial driver's license general knowledge test for operating heavy vehicles safely.",
    questionCount: 50,
    durationMin: 60,
    difficulty: "medium",
    careerContext: "Commercial Driver's License (CDL) General Knowledge exam",
  },
  {
    slug: "servsafe-food-handler",
    name: "ServSafe Food Handler",
    category: "trade",
    blurb:
      "Food safety certification: foodborne illness, hygiene, time/temperature, and sanitation.",
    questionCount: 40,
    durationMin: 60,
    difficulty: "medium",
    careerContext: "ServSafe Food Handler / food safety certification exam",
  },
  {
    slug: "real-estate-salesperson",
    name: "Real Estate Salesperson",
    category: "trade",
    blurb:
      "Pre-licensing exam: real estate principles, practices, contracts, and law.",
    questionCount: 50,
    durationMin: 120,
    difficulty: "hard",
    careerContext: "Real Estate Salesperson licensing exam",
  },
  {
    slug: "epa-608-core",
    name: "EPA 608 (Core)",
    category: "trade",
    blurb:
      "HVAC/refrigerant handling certification covering the EPA Section 608 core knowledge.",
    questionCount: 40,
    durationMin: 60,
    difficulty: "hard",
    careerContext: "EPA Section 608 Core refrigerant handling certification exam",
  },
  {
    slug: "nclex-rn",
    name: "NCLEX-RN (Practice)",
    category: "trade",
    blurb:
      "Registered nurse licensing practice: safe care, health promotion, and clinical judgment.",
    questionCount: 50,
    durationMin: 120,
    difficulty: "hard",
    careerContext: "NCLEX-RN registered nurse licensing exam",
  },
  {
    slug: "pmp",
    name: "PMP (Project Management)",
    category: "trade",
    blurb:
      "Project Management Professional practice: people, process, and business environment.",
    questionCount: 45,
    durationMin: 90,
    difficulty: "hard",
    careerContext: "PMP Project Management Professional certification exam",
  },
];

const BY_SLUG = new Map(EXAM_CATALOG.map((e) => [e.slug, e]));

export function getExam(slug: string): CatalogExam | undefined {
  return BY_SLUG.get(slug);
}

export interface CatalogCategoryDto {
  key: ExamCategory;
  label: string;
  exams: Array<{
    slug: string;
    name: string;
    blurb: string;
    questionCount: number;
    durationMin: number;
  }>;
}

/** Catalog grouped by category, in display order, for the frontend. */
export function listExamsByCategory(): CatalogCategoryDto[] {
  return CATEGORY_ORDER.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    exams: EXAM_CATALOG.filter((e) => e.category === key).map((e) => ({
      slug: e.slug,
      name: e.name,
      blurb: e.blurb,
      questionCount: e.questionCount,
      durationMin: e.durationMin,
    })),
  }));
}
