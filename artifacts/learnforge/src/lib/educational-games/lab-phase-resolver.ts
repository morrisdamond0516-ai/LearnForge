import type { LabPhaseQuestion, SkillGameType } from "./skill-game-types";
import {
  SKILL_GAME_TYPE_INSTRUCTIONS,
  SKILL_GAME_TYPE_LABELS,
} from "./skill-game-types";

export type LabModuleMeta = {
  /** Unique key, e.g. career:it-support:helpdesk-queue */
  scopeKey: string;
  title: string;
  description: string;
  domain?: string;
  gameType: SkillGameType;
};

/** Hand-authored overrides — keyed by scopeKey. Falls back to auto-generated phases. */
export const CUSTOM_LAB_PHASES: Partial<
  Record<string, { prep?: LabPhaseQuestion[]; recall?: LabPhaseQuestion[] }>
> = {};

function trimOption(text: string, max = 100): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3)}...`;
}

export function buildAutoLabPhases(meta: LabModuleMeta): {
  prep: LabPhaseQuestion[];
  recall: LabPhaseQuestion[];
} {
  const tool = SKILL_GAME_TYPE_LABELS[meta.gameType];
  const topic = meta.title;
  const about = meta.description;
  const field = meta.domain ?? "this topic";

  const prep: LabPhaseQuestion[] = [
    {
      prompt: `What is the main focus of "${topic}"?`,
      options: [
        trimOption(about),
        "Memorize unrelated vocabulary only",
        "Skip practice and go straight to a final exam",
        "Watch a lecture with no interactive component",
      ],
      correctIndex: 0,
      explanation: about,
    },
    {
      prompt: `What kind of practice is the hands-on step in this lab?`,
      options: [
        tool,
        "External paid simulator login required",
        "Paper worksheet with no on-screen tools",
        "Multiple-choice only — no workspace",
      ],
      correctIndex: 0,
      explanation: SKILL_GAME_TYPE_INSTRUCTIONS[meta.gameType],
    },
  ];

  const recall: LabPhaseQuestion[] = [
    {
      prompt: `After completing "${topic}", you should be ready to:`,
      options: [
        `Use the ${field} skills you practiced in the ${tool.toLowerCase()} activity`,
        "Ignore the workspace and rely only on guessing",
        "Avoid the tools and procedures shown in the lab",
        "Treat this module as optional reading only",
      ],
      correctIndex: 0,
      explanation: about,
    },
    {
      prompt: `How does this lab module fit in LearnForge?`,
      options: [
        "Warm-up → hands-on practice → recall — all in one module before Curriculum quizzes",
        "A random quiz that replaces hands-on practice",
        "Only counts if you skip the workspace step",
        "Separate from the lab — opens a different app section",
      ],
      correctIndex: 0,
      explanation:
        "Each lab module walks you through prep, practice, and recall so you always know where you are in the flow.",
    },
  ];

  return { prep, recall };
}

export function resolveLabPhases(
  meta: LabModuleMeta,
  explicit?: { prep?: LabPhaseQuestion[]; recall?: LabPhaseQuestion[] },
): { prep: LabPhaseQuestion[]; recall: LabPhaseQuestion[] } {
  const custom = CUSTOM_LAB_PHASES[meta.scopeKey];
  const auto = buildAutoLabPhases(meta);
  const prep =
    explicit?.prep?.length ? explicit.prep : custom?.prep?.length ? custom.prep : auto.prep;
  const recall =
    explicit?.recall?.length
      ? explicit.recall
      : custom?.recall?.length
        ? custom.recall
        : auto.recall;
  return { prep, recall };
}

/** Register custom phases at load time (e.g. from track files). */
export function registerLabPhases(
  scopeKey: string,
  phases: { prep?: LabPhaseQuestion[]; recall?: LabPhaseQuestion[] },
): void {
  CUSTOM_LAB_PHASES[scopeKey] = phases;
}

export function careerModuleScopeKey(
  careerSlug: string,
  moduleId: string,
): string {
  return `career:${careerSlug}:${moduleId}`;
}

export function educationScopeKey(slug: string): string {
  return `education:${slug}`;
}

export function subjectScopeKey(slug: string): string {
  return `subject:${slug}`;
}
