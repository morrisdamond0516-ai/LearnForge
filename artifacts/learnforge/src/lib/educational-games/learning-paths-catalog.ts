import type { BuiltInGameId } from "./types";

/**
 * First-class learning products (not arcade games).
 * Surfaced in careers, curriculum, subjects, and study guides.
 */
export type LearningPathId = "javascript" | "ai";

export type LearningPathEntry = {
  id: LearningPathId;
  /** Built-in hub that hosts the progressive curriculum */
  gameId: BuiltInGameId;
  title: string;
  shortTitle: string;
  emoji: string;
  description: string;
  /** Exact CAREER_OPTIONS name */
  careerName: string;
  careerSlug: "javascript-developer" | "ai-specialist";
  /** Names that resolve this path in curriculum / search */
  subjectAliases: string[];
  studyGuideTopics: string[];
  href: string;
};

export const LEARNING_PATHS: LearningPathEntry[] = [
  {
    id: "javascript",
    gameId: "js-job-path",
    title: "JavaScript That Sticks",
    shortTitle: "JavaScript",
    emoji: "🟨",
    description:
      "Learn JavaScript from values through the DOM so it sticks — mental models, write-from-scratch practice, and explain-why checks.",
    careerName: "JavaScript Developer",
    careerSlug: "javascript-developer",
    subjectAliases: [
      "JavaScript",
      "JavaScript Developer",
      "JS",
      "Web Development with JavaScript",
      "Frontend JavaScript",
    ],
    studyGuideTopics: [
      "JavaScript fundamentals",
      "JavaScript arrays and objects",
      "JavaScript DOM and events",
      "JavaScript async await",
    ],
    href: "/games?game=js-job-path",
  },
  {
    id: "ai",
    gameId: "ai-job-path",
    title: "AI Career Path",
    shortTitle: "Artificial Intelligence",
    emoji: "🤖",
    description:
      "Learn the AI stack employers hire for — foundations, then Data for AI, Applied AI, ML, MLOps, and AI Product judgment.",
    careerName: "AI Specialist / AI Engineer",
    careerSlug: "ai-specialist",
    subjectAliases: [
      "Artificial Intelligence",
      "AI",
      "AI Specialist / AI Engineer",
      "AI Engineer",
      "Machine Learning",
      "MLOps",
      "Applied AI",
    ],
    studyGuideTopics: [
      "Artificial intelligence fundamentals",
      "RAG retrieval augmented generation",
      "Machine learning evaluation metrics",
      "MLOps model deployment monitoring",
    ],
    href: "/games?game=ai-job-path",
  },
];

export function getLearningPathById(
  id: LearningPathId,
): LearningPathEntry | undefined {
  return LEARNING_PATHS.find((p) => p.id === id);
}

export function getLearningPathByGameId(
  gameId: string,
): LearningPathEntry | undefined {
  return LEARNING_PATHS.find((p) => p.gameId === gameId);
}

export function getLearningPathByCareerSlug(
  slug: string,
): LearningPathEntry | undefined {
  return LEARNING_PATHS.find((p) => p.careerSlug === slug);
}

/** Match curriculum / subject / search text to a learning path. */
export function resolveLearningPath(
  subject: string,
): LearningPathEntry | undefined {
  const needle = subject.trim().toLowerCase();
  if (!needle) return undefined;

  for (const path of LEARNING_PATHS) {
    if (path.subjectAliases.some((a) => a.toLowerCase() === needle)) {
      return path;
    }
  }

  // JavaScript-specific (before generic "developer")
  if (
    /\bjavascript\b/.test(needle) ||
    /\becmascript\b/.test(needle) ||
    needle === "js" ||
    /\bjs\b/.test(needle)
  ) {
    return getLearningPathById("javascript");
  }

  // AI / ML family
  if (
    /\bartificial intelligence\b/.test(needle) ||
    /\bmachine learning\b/.test(needle) ||
    /\bmlops\b/.test(needle) ||
    /\bai engineer\b/.test(needle) ||
    /\bai specialist\b/.test(needle) ||
    /\bapplied ai\b/.test(needle) ||
    /\bprompt engineer/.test(needle) ||
    needle === "ai" ||
    /(^|[^a-z])ai([^a-z]|$)/.test(needle)
  ) {
    return getLearningPathById("ai");
  }

  return undefined;
}
