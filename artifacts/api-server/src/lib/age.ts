/**
 * Age / under-18 helpers shared by the entitlement logic and the account
 * (`/me`) routes. Birthdates are stored as `YYYY-MM-DD` strings (Drizzle `date`).
 */

/** Learners under 18 get this many months of free access before any charge. */
export const JUNIOR_FREE_MONTHS = 9;

/** Age in whole years from a birthdate, or null if unknown/invalid. */
export function computeAge(
  birthDate: string | Date | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!birthDate) return null;
  const d =
    typeof birthDate === "string"
      ? new Date(`${birthDate}T00:00:00Z`)
      : birthDate;
  if (Number.isNaN(d.getTime())) return null;
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - d.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < d.getUTCDate())) {
    age -= 1;
  }
  return age;
}

/** True when the birthdate indicates the learner is under 18. */
export function isMinor(
  birthDate: string | Date | null | undefined,
  now: Date = new Date(),
): boolean {
  const age = computeAge(birthDate, now);
  return age !== null && age < 18;
}

/** End of a minor's 9-month free window, measured from their signup date. */
export function juniorWindowEnd(createdAt: Date): Date {
  const d = new Date(createdAt);
  d.setUTCMonth(d.getUTCMonth() + JUNIOR_FREE_MONTHS);
  return d;
}
