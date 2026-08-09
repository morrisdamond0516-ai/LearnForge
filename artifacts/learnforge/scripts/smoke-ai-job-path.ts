import {
  AI_JOB_PATH_MODULES,
  foundationModules,
  roleModules,
} from "../src/lib/educational-games/ai-job-path-content";
import { evaluatePractice } from "../src/lib/educational-games/ai-job-path-runner";

function main() {
  const foundations = foundationModules();
  const roles = roleModules();
  console.log(
    "modules",
    AI_JOB_PATH_MODULES.length,
    "foundations",
    foundations.length,
    "roles",
    roles.length,
    "lessons",
    AI_JOB_PATH_MODULES.reduce((n, m) => n + m.lessons.length, 0),
  );

  if (foundations.length !== 6) throw new Error("Expected 6 foundation modules");
  if (roles.length !== 5) throw new Error("Expected 5 role modules");

  for (const mod of AI_JOB_PATH_MODULES) {
    if (mod.lessons.length < 4) {
      throw new Error(`${mod.id} needs >= 4 lessons`);
    }
    if (!mod.youWillUnderstand) throw new Error(`${mod.id} missing goal`);
    for (const lesson of mod.lessons) {
      if (!lesson.teach?.idea || !lesson.practice || !lesson.reflect) {
        throw new Error(`${lesson.id} incomplete`);
      }
    }
  }

  const promptLesson = AI_JOB_PATH_MODULES.flatMap((m) => m.lessons).find(
    (l) => l.practice.kind === "prompt-rubric",
  );
  if (!promptLesson || promptLesson.practice.kind !== "prompt-rubric") {
    throw new Error("Missing prompt-rubric lesson");
  }
  const good = evaluatePractice(promptLesson.practice, {
    promptText:
      "You are an invoice extractor. Task: extract date, amount, vendor. Return only JSON with those keys. If missing use null — do not invent values.",
  });
  if (!good.ok) {
    console.error(good);
    throw new Error("Expected good prompt to pass rubric");
  }

  const seq = AI_JOB_PATH_MODULES.flatMap((m) => m.lessons).find(
    (l) => l.practice.kind === "sequence",
  );
  if (!seq || seq.practice.kind !== "sequence") throw new Error("Missing sequence");
  const seqOk = evaluatePractice(seq.practice, {
    sequenceOrder: seq.practice.correctOrder,
  });
  if (!seqOk.ok) throw new Error("Sequence should pass in correct order");

  console.log("smoke OK");
}

main();
