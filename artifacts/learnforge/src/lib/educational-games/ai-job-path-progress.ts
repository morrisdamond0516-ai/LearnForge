import {
  AI_JOB_PATH_MODULES,
  foundationModules,
  type AiModule,
} from "./ai-job-path-content";

const STORAGE_KEY = "learnforge-ai-career-path-v1";

export type AiJobPathProgress = {
  passedLessons: string[];
  recallPassed: string[];
};

export function loadAiJobPathProgress(): AiJobPathProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { passedLessons: [], recallPassed: [] };
    const parsed = JSON.parse(raw) as Partial<AiJobPathProgress>;
    return {
      passedLessons: Array.isArray(parsed.passedLessons)
        ? parsed.passedLessons
        : [],
      recallPassed: Array.isArray(parsed.recallPassed) ? parsed.recallPassed : [],
    };
  } catch {
    return { passedLessons: [], recallPassed: [] };
  }
}

export function saveAiJobPathProgress(progress: AiJobPathProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markLessonPassed(lessonId: string): AiJobPathProgress {
  const prev = loadAiJobPathProgress();
  if (prev.passedLessons.includes(lessonId)) return prev;
  const next = {
    ...prev,
    passedLessons: [...prev.passedLessons, lessonId],
  };
  saveAiJobPathProgress(next);
  return next;
}

export function markRecallPassed(moduleId: string): AiJobPathProgress {
  const prev = loadAiJobPathProgress();
  if (prev.recallPassed.includes(moduleId)) return prev;
  const next = {
    ...prev,
    recallPassed: [...prev.recallPassed, moduleId],
  };
  saveAiJobPathProgress(next);
  return next;
}

export function resetAiJobPathProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export function modulePassedCount(
  moduleId: string,
  progress: AiJobPathProgress,
): number {
  const mod = AI_JOB_PATH_MODULES.find((m) => m.id === moduleId);
  if (!mod) return 0;
  return mod.lessons.filter((l) => progress.passedLessons.includes(l.id)).length;
}

export function isModuleMastered(
  moduleId: string,
  progress: AiJobPathProgress,
): boolean {
  const mod = AI_JOB_PATH_MODULES.find((m) => m.id === moduleId);
  if (!mod) return false;
  const passed = modulePassedCount(moduleId, progress);
  const recallOk =
    mod.recall.length === 0 || progress.recallPassed.includes(moduleId);
  return passed >= mod.masteryRequired && recallOk;
}

export function foundationsComplete(progress: AiJobPathProgress): boolean {
  return foundationModules().every((m) => isModuleMastered(m.id, progress));
}

/** Foundations are linear; role tracks unlock after all foundations are mastered. */
export function isModuleUnlocked(
  module: AiModule,
  progress: AiJobPathProgress,
): boolean {
  if (module.track === "foundation") {
    const foundations = foundationModules();
    const idx = foundations.findIndex((m) => m.id === module.id);
    if (idx <= 0) return true;
    const prev = foundations[idx - 1];
    return prev ? isModuleMastered(prev.id, progress) : false;
  }
  return foundationsComplete(progress);
}

export function pathStats(progress: AiJobPathProgress) {
  const totalLessons = AI_JOB_PATH_MODULES.reduce(
    (n, m) => n + m.lessons.length,
    0,
  );
  const masteredModules = AI_JOB_PATH_MODULES.filter((m) =>
    isModuleMastered(m.id, progress),
  ).length;
  return {
    passedLessons: progress.passedLessons.length,
    totalLessons,
    masteredModules,
    totalModules: AI_JOB_PATH_MODULES.length,
    foundationsDone: foundationsComplete(progress),
  };
}
