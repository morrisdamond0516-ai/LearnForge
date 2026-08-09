import { JS_JOB_PATH_MODULES } from "./js-job-path-content";

/** v2: curriculum rebuilt for understanding (new challenge ids). */
const STORAGE_KEY = "learnforge-js-that-sticks-v2";

export type JsJobPathProgress = {
  passedChallenges: string[];
  recallPassed: string[];
};

export function loadJsJobPathProgress(): JsJobPathProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { passedChallenges: [], recallPassed: [] };
    const parsed = JSON.parse(raw) as Partial<JsJobPathProgress>;
    return {
      passedChallenges: Array.isArray(parsed.passedChallenges)
        ? parsed.passedChallenges
        : [],
      recallPassed: Array.isArray(parsed.recallPassed) ? parsed.recallPassed : [],
    };
  } catch {
    return { passedChallenges: [], recallPassed: [] };
  }
}

export function saveJsJobPathProgress(progress: JsJobPathProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markChallengePassed(challengeId: string): JsJobPathProgress {
  const prev = loadJsJobPathProgress();
  if (prev.passedChallenges.includes(challengeId)) return prev;
  const next = {
    ...prev,
    passedChallenges: [...prev.passedChallenges, challengeId],
  };
  saveJsJobPathProgress(next);
  return next;
}

export function markRecallPassed(moduleId: string): JsJobPathProgress {
  const prev = loadJsJobPathProgress();
  if (prev.recallPassed.includes(moduleId)) return prev;
  const next = {
    ...prev,
    recallPassed: [...prev.recallPassed, moduleId],
  };
  saveJsJobPathProgress(next);
  return next;
}

export function resetJsJobPathProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export function modulePassedCount(
  moduleId: string,
  progress: JsJobPathProgress,
): number {
  const mod = JS_JOB_PATH_MODULES.find((m) => m.id === moduleId);
  if (!mod) return 0;
  return mod.challenges.filter((c) =>
    progress.passedChallenges.includes(c.id),
  ).length;
}

export function isModuleMastered(
  moduleId: string,
  progress: JsJobPathProgress,
): boolean {
  const mod = JS_JOB_PATH_MODULES.find((m) => m.id === moduleId);
  if (!mod) return false;
  const passed = modulePassedCount(moduleId, progress);
  const recallOk =
    mod.recall.length === 0 || progress.recallPassed.includes(moduleId);
  return passed >= mod.masteryRequired && recallOk;
}

export function isModuleUnlocked(
  moduleIndex: number,
  progress: JsJobPathProgress,
): boolean {
  if (moduleIndex <= 0) return true;
  const prev = JS_JOB_PATH_MODULES[moduleIndex - 1];
  return prev ? isModuleMastered(prev.id, progress) : false;
}

export function pathStats(progress: JsJobPathProgress) {
  const totalChallenges = JS_JOB_PATH_MODULES.reduce(
    (n, m) => n + m.challenges.length,
    0,
  );
  const masteredModules = JS_JOB_PATH_MODULES.filter((m) =>
    isModuleMastered(m.id, progress),
  ).length;
  return {
    passedChallenges: progress.passedChallenges.length,
    totalChallenges,
    masteredModules,
    totalModules: JS_JOB_PATH_MODULES.length,
  };
}
