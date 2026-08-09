import type { AiPractice, AiRubricItem } from "./ai-job-path-content";

export type AiPracticeResult = {
  ok: boolean;
  feedback: string;
  details?: string[];
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function scorePromptRubric(
  promptText: string,
  items: AiRubricItem[],
  minPassed: number,
): AiPracticeResult {
  const hay = normalize(promptText);
  if (hay.length < 24) {
    return {
      ok: false,
      feedback: "Write a fuller prompt — include role, task, constraints, and output format.",
      details: [],
    };
  }
  const details: string[] = [];
  let passed = 0;
  for (const item of items) {
    const hit = item.patterns.some((p) => hay.includes(normalize(p)));
    if (hit) {
      passed += 1;
      details.push(`✓ ${item.label}`);
    } else {
      details.push(`✗ Missing: ${item.label}`);
    }
  }
  const ok = passed >= minPassed;
  return {
    ok,
    feedback: ok
      ? `Rubric passed (${passed}/${items.length}). Solid production-style prompt.`
      : `Need at least ${minPassed} rubric items (you have ${passed}/${items.length}). Strengthen the weak spots.`,
    details,
  };
}

export function scoreChecklist(
  selectedIds: string[],
  items: { id: string; label: string; required: boolean }[],
  minRequired: number,
): AiPracticeResult {
  const required = items.filter((i) => i.required);
  const selected = new Set(selectedIds);
  const hitRequired = required.filter((i) => selected.has(i.id));
  const wrong = items.filter((i) => !i.required && selected.has(i.id));
  const details = [
    ...hitRequired.map((i) => `✓ ${i.label}`),
    ...required
      .filter((i) => !selected.has(i.id))
      .map((i) => `✗ Missing: ${i.label}`),
    ...wrong.map((i) => `✗ Extra / risky: ${i.label}`),
  ];
  const ok = hitRequired.length >= minRequired && wrong.length === 0;
  return {
    ok,
    feedback: ok
      ? "Checklist looks production-ready."
      : "Select the required pieces and avoid the distractors.",
    details,
  };
}

export function scoreSequence(
  currentOrder: string[],
  correctOrder: string[],
): AiPracticeResult {
  const ok =
    currentOrder.length === correctOrder.length &&
    currentOrder.every((s, i) => s === correctOrder[i]);
  return {
    ok,
    feedback: ok
      ? "Order is correct — that's how real pipelines run."
      : "Not quite — rethink dependencies: what must exist before the next step?",
  };
}

export function evaluatePractice(
  practice: AiPractice,
  input: {
    choiceIndex?: number;
    promptText?: string;
    selectedIds?: string[];
    sequenceOrder?: string[];
    scenarioIndex?: number;
  },
): AiPracticeResult {
  switch (practice.kind) {
    case "choice": {
      const ok = input.choiceIndex === practice.correctIndex;
      return {
        ok,
        feedback: ok
          ? practice.explanation
          : `Not the best choice. ${practice.explanation}`,
      };
    }
    case "prompt-rubric":
      return scorePromptRubric(
        input.promptText ?? "",
        practice.mustInclude,
        practice.minPassed,
      );
    case "checklist":
      return scoreChecklist(
        input.selectedIds ?? [],
        practice.items,
        practice.minRequired,
      );
    case "sequence":
      return scoreSequence(input.sequenceOrder ?? [], practice.correctOrder);
    case "scenario": {
      const opt = practice.options[input.scenarioIndex ?? -1];
      if (!opt) {
        return { ok: false, feedback: "Pick an option." };
      }
      return { ok: opt.correct, feedback: opt.feedback };
    }
    default:
      return { ok: false, feedback: "Unknown practice type." };
  }
}
