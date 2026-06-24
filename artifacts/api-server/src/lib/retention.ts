import { db, attemptsTable, analyticsEventsTable } from "@workspace/db";
import { lt } from "drizzle-orm";
import { logger } from "./logger";

/**
 * How long a learner's *activity* (test attempts / results) is kept before it
 * is automatically purged. Saved items the learner explicitly created
 * (subjects, study guides, curricula, career plans, uploaded documents) are NOT
 * touched — those stay until the learner deletes them.
 */
export const RETENTION_DAYS = 90;

/**
 * How long raw site-analytics events are kept. The owner dashboard reports over
 * windows up to 365 days, so keep a little over a year before pruning. This
 * caps growth of the append-only `analytics_events` table.
 */
export const ANALYTICS_RETENTION_DAYS = 400;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Delete test attempts older than the retention window. Returns the count. */
export async function purgeExpiredActivity(
  now: Date = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * DAY_MS);
  const deleted = await db
    .delete(attemptsTable)
    .where(lt(attemptsTable.completedAt, cutoff))
    .returning({ id: attemptsTable.id });
  return deleted.length;
}

/** Delete analytics events older than the analytics retention window. */
export async function purgeExpiredAnalytics(
  now: Date = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - ANALYTICS_RETENTION_DAYS * DAY_MS);
  const deleted = await db
    .delete(analyticsEventsTable)
    .where(lt(analyticsEventsTable.createdAt, cutoff))
    .returning({ id: analyticsEventsTable.id });
  return deleted.length;
}

let started = false;

/**
 * Start the daily retention sweep. Runs once immediately on boot, then every
 * 24 hours. Best-effort: failures are logged, never thrown, and the timer is
 * unref'd so it can't keep the process alive on its own.
 */
export function startRetentionJob(): void {
  if (started) return;
  started = true;

  const run = (): void => {
    purgeExpiredActivity()
      .then((count) => {
        if (count > 0) {
          logger.info({ count }, "Retention: purged expired activity");
        }
      })
      .catch((err) => logger.error({ err }, "Retention purge failed"));

    purgeExpiredAnalytics()
      .then((count) => {
        if (count > 0) {
          logger.info({ count }, "Retention: purged expired analytics");
        }
      })
      .catch((err) =>
        logger.error({ err }, "Retention analytics purge failed"),
      );
  };

  run();
  const timer = setInterval(run, DAY_MS);
  timer.unref();
}
