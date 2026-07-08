export type SkillGameType =
  | "code-trace"
  | "typing-drill"
  | "sequence-build"
  | "match-pairs"
  | "math-scenario"
  | "script-choice";

export const SKILL_GAME_TYPE_LABELS: Record<SkillGameType, string> = {
  "match-pairs": "Memory match",
  "math-scenario": "Problem solving",
  "sequence-build": "Step ordering",
  "script-choice": "Scenario choices",
  "typing-drill": "Typing practice",
  "code-trace": "Code + build",
};

export const SKILL_GAME_TYPE_INSTRUCTIONS: Record<SkillGameType, string> = {
  "match-pairs":
    "Flip two cards at a time. Match each term with its correct definition. All pairs must match to finish — fewer moves means a better score.",
  "math-scenario":
    "Read each problem and pick the best answer. You get instant feedback and an explanation after every question.",
  "sequence-build":
    "Put the steps in the correct order using the up/down arrows, then check your answer. Order matters from first step to last.",
  "script-choice":
    "Read each real-world scenario and choose the best professional response. Feedback explains why each choice works or doesn't.",
  "typing-drill":
    "Type each phrase exactly as shown. Context hints tell you when you'd use this language on the job or in class.",
  "code-trace":
    "First, trace the code and fix the bug. Then assemble the PC parts in the correct build order.",
};

export type ScriptScenario = {
  prompt: string;
  options: { text: string; feedback: string; points: number }[];
};

export type MathScenario = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type MatchPair = { term: string; definition: string };

export type CodeChallenge = {
  title: string;
  code: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  codeSubtitle?: string;
};

export type TypingPhrase = { text: string; context: string };

export type SkillGameContent = {
  script?: ScriptScenario[];
  math?: MathScenario[];
  pairs?: MatchPair[];
  sequence?: string[];
  code?: CodeChallenge[];
  pcBuild?: string[];
  typing?: TypingPhrase[];
  codePhaseSubtitle?: string;
  buildPhaseTitle?: string;
  buildPhaseSubtitle?: string;
  finishTitle?: string;
};

export function getSkillGameFormatSummary(
  gameType: SkillGameType,
  content: SkillGameContent,
): string {
  switch (gameType) {
    case "math-scenario":
      return `${content.math?.length ?? 0} problems`;
    case "match-pairs":
      return `${content.pairs?.length ?? 0} pairs to match`;
    case "sequence-build":
      return `${content.sequence?.length ?? 0} steps to order`;
    case "script-choice":
      return `${content.script?.length ?? 0} scenarios`;
    case "typing-drill":
      return `${content.typing?.length ?? 0} phrases to type`;
    case "code-trace":
      return `${content.code?.length ?? 0} code puzzles + PC build`;
    default:
      return SKILL_GAME_TYPE_LABELS[gameType];
  }
}
