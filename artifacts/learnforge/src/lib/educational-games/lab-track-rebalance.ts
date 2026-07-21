import type {
  CodeChallenge,
  LabPhaseQuestion,
  MatchPair,
  MathScenario,
  ScriptScenario,
  SkillGameType,
} from "./skill-game-types";
import { isWorkspaceLab } from "./skill-game-types";
import type { CareerLabModule } from "./career-lab-tracks-extended";
import { buildAutoLabPhases } from "./lab-phase-resolver";

function bestScriptIndex(options: ScriptScenario["options"]): number {
  let best = 0;
  let max = -1;
  options.forEach((o, i) => {
    if (o.points > max) {
      max = o.points;
      best = i;
    }
  });
  return best;
}

export function scriptToLabPhases(script?: ScriptScenario[]): LabPhaseQuestion[] {
  return (script ?? []).map((s) => {
    const correct = bestScriptIndex(s.options);
    return {
      prompt: s.prompt,
      options: s.options.map((o) => o.text),
      correctIndex: correct,
      explanation: s.options[correct]?.feedback ?? "",
    };
  });
}

export function mathToLabPhases(math?: MathScenario[]): LabPhaseQuestion[] {
  return math ?? [];
}

export function pairsToLabPhases(
  pairs?: MatchPair[],
  otherPairs?: MatchPair[],
): LabPhaseQuestion[] {
  const pool = otherPairs ?? pairs ?? [];
  return (pairs ?? []).map((p) => {
    const distractors = pool
      .filter((x) => x.term !== p.term)
      .map((x) => x.definition)
      .slice(0, 3);
    while (distractors.length < 3) {
      distractors.push("Not a standard definition for this term");
    }
    const options = [p.definition, distractors[0], distractors[1], distractors[2]];
    return {
      prompt: `Match the term: "${p.term}"`,
      options,
      correctIndex: 0,
      explanation: `${p.term}: ${p.definition}`,
    };
  });
}

export function sequenceToLabPhases(
  steps?: string[],
  title?: string,
): LabPhaseQuestion[] {
  if (!steps || steps.length < 2) return [];
  const label = title ?? "this procedure";
  const last = steps.length - 1;
  const mid = Math.min(1, last);
  const questions: LabPhaseQuestion[] = [
    {
      prompt: `What is the FIRST step in ${label}?`,
      options: [steps[0], steps[mid], steps[last], steps[Math.min(2, last)]],
      correctIndex: 0,
      explanation: `Start with: ${steps[0]}`,
    },
  ];
  if (last > 0) {
    questions.push({
      prompt: `What is the FINAL step in ${label}?`,
      options: [steps[last], steps[0], steps[mid], steps[Math.min(2, last)]],
      correctIndex: 0,
      explanation: `Finish with: ${steps[last]}`,
    });
  }
  return questions;
}

export function codeToLabPhases(code?: CodeChallenge[]): LabPhaseQuestion[] {
  return (code ?? []).map((c) => ({
    prompt: c.question,
    options: c.options,
    correctIndex: c.correctIndex,
    explanation: c.explanation,
  }));
}

/** Convert a quiz-style module's content into warm-up / recall questions. */
export function drillModuleToPhases(mod: CareerLabModule): {
  prep: LabPhaseQuestion[];
  recall: LabPhaseQuestion[];
} {
  const { gameType, content, title } = mod;
  switch (gameType) {
    case "script-choice":
      return { prep: scriptToLabPhases(content.script), recall: [] };
    case "math-scenario":
      return { prep: mathToLabPhases(content.math), recall: [] };
    case "match-pairs":
      return {
        prep: pairsToLabPhases(content.pairs),
        recall: pairsToLabPhases(content.pairs),
      };
    case "sequence-build":
      return {
        prep: [],
        recall: sequenceToLabPhases(content.sequence, title),
      };
    case "code-trace": {
      const buildRecall = sequenceToLabPhases(
        content.pcBuild,
        content.buildPhaseTitle ?? "assembly checklist",
      );
      return {
        prep: codeToLabPhases(content.code),
        recall: buildRecall,
      };
    }
    case "typing-drill":
      return { prep: [], recall: [] };
    default:
      return { prep: [], recall: [] };
  }
}

function mergePhases(
  base: LabPhaseQuestion[] | undefined,
  extra: LabPhaseQuestion[],
): LabPhaseQuestion[] {
  if (!extra.length) return base ?? [];
  return [...(base ?? []), ...extra];
}

function distributePhases(
  workspaces: CareerLabModule[],
  allPrep: LabPhaseQuestion[],
  allRecall: LabPhaseQuestion[],
): CareerLabModule[] {
  if (workspaces.length === 0) return [];

  const prepChunks: LabPhaseQuestion[][] = workspaces.map(() => []);
  const recallChunks: LabPhaseQuestion[][] = workspaces.map(() => []);

  allPrep.forEach((q, i) => {
    prepChunks[i % workspaces.length]!.push(q);
  });
  allRecall.forEach((q, i) => {
    recallChunks[i % workspaces.length]!.push(q);
  });

  return workspaces.map((ws, i) => ({
    ...ws,
    prep: mergePhases(ws.prep, prepChunks[i]!),
    recall: mergePhases(ws.recall, recallChunks[i]!),
  }));
}

export type RebalancedCareerTrack = {
  /** Hands-on workspace labs only — quiz drills absorbed into prep/recall. */
  labs: CareerLabModule[];
  /** Quiz-style modules removed from the lab list (content merged into labs). */
  absorbedDrills: CareerLabModule[];
};

/**
 * Rebalance a career track: workspace modules stay as labs; drill modules
 * convert to prep/recall on those labs and are removed from the lab picker.
 */
export function rebalanceCareerTrack(
  track: CareerLabModule[],
): RebalancedCareerTrack {
  const workspaces = track.filter((m) => isWorkspaceLab(m.gameType));
  const drills = track.filter((m) => !isWorkspaceLab(m.gameType));

  const drillPrep: LabPhaseQuestion[] = [];
  const drillRecall: LabPhaseQuestion[] = [];
  for (const d of drills) {
    const phases = drillModuleToPhases(d);
    drillPrep.push(...phases.prep);
    drillRecall.push(...phases.recall);
  }

  const labs = distributePhases(workspaces, drillPrep, drillRecall).map((ws) =>
    ensureMinimumPhases(ws),
  );

  return { labs, absorbedDrills: drills };
}

function ensureMinimumPhases(ws: CareerLabModule): CareerLabModule {
  const auto = buildAutoLabPhases({
    scopeKey: ws.id,
    title: ws.title,
    description: ws.description,
    domain: ws.domain,
    gameType: ws.gameType,
  });
  const prep =
    (ws.prep?.length ?? 0) >= 2 ? ws.prep : mergePhases(ws.prep, auto.prep);
  const recall =
    (ws.recall?.length ?? 0) >= 2 ? ws.recall : mergePhases(ws.recall, auto.recall);
  return { ...ws, prep, recall };
}

export function isScenarioDrillModule(mod: CareerLabModule): boolean {
  return !isWorkspaceLab(mod.gameType);
}

export function scenarioDrillLabel(gameType: SkillGameType): string {
  return `Scenario drill · ${gameType.replace(/-/g, " ")}`;
}
