export type LabAttempt = {
  score: number;
  timeStr: string;
  hintsUsed: number;
  completedAt: string;
};

const PREFIX = "learnforge:lab-history:";

function readHistory(labId: string): LabAttempt[] {
  try {
    const raw = localStorage.getItem(PREFIX + labId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLabAttempt(labId: string, attempt: LabAttempt): void {
  const existing = readHistory(labId);
  const updated = [attempt, ...existing].slice(0, 10);
  try {
    localStorage.setItem(PREFIX + labId, JSON.stringify(updated));
  } catch {
    // storage full or blocked — silently skip
  }
}

export function getBestLabAttempt(labId: string): LabAttempt | null {
  const history = readHistory(labId);
  if (history.length === 0) return null;
  return history.reduce((best, curr) =>
    curr.score > best.score ? curr : best,
  );
}

export function getLabAttemptCount(labId: string): number {
  return readHistory(labId).length;
}
