import { Router, type IRouter } from "express";
import { db, userStatsTable, badgesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  BADGE_CATALOG,
  levelProgress,
  handleForUser,
  recordGameActivity,
} from "../lib/gamification";

const router: IRouter = Router();

function utcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** The signed-in user's gamification snapshot. */
router.get("/gamification/me", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const [stats] = await db
    .select()
    .from(userStatsTable)
    .where(eq(userStatsTable.userId, userId));

  const earned = await db
    .select()
    .from(badgesTable)
    .where(eq(badgesTable.userId, userId));
  const earnedMap = new Map(earned.map((b) => [b.badgeKey, b.earnedAt]));

  const xp = stats?.xp ?? 0;
  const now = new Date();
  const today = utcDay(now);
  const yesterday = utcDay(new Date(now.getTime() - 86400000));
  const todayCount =
    stats && stats.lastActivityDate === today ? stats.todayCount : 0;
  const dailyGoal = stats?.dailyGoal ?? 3;

  // A streak is only still alive if the last activity was today or yesterday;
  // otherwise it's broken and should read 0 even though the stored value lags
  // until the next activity rewrites it.
  const streakAlive =
    stats?.lastActivityDate === today || stats?.lastActivityDate === yesterday;

  res.json({
    xp,
    ...levelProgress(xp),
    currentStreak: streakAlive ? stats!.currentStreak : 0,
    longestStreak: stats?.longestStreak ?? 0,
    dailyGoal,
    todayCount,
    goalMet: todayCount >= dailyGoal,
    badges: BADGE_CATALOG.map((b) => ({
      key: b.key,
      name: b.name,
      description: b.description,
      earned: earnedMap.has(b.key),
      earnedAt: earnedMap.get(b.key)?.toISOString() ?? null,
    })),
  });
});

/** Record a completed learning game and award XP / badges. */
router.post("/gamification/game-complete", async (req, res): Promise<void> => {
  const body = req.body as { gameId?: unknown; scorePct?: unknown };
  const gameId = typeof body.gameId === "string" ? body.gameId.trim() : "";
  if (!gameId) {
    res.status(400).json({ error: "gameId is required." });
    return;
  }
  const scorePct =
    typeof body.scorePct === "number" && Number.isFinite(body.scorePct)
      ? body.scorePct
      : undefined;

  try {
    const result = await recordGameActivity(req.userId!, { gameId, scorePct });
    res.json({
      xpAwarded: result.xpAwarded,
      newBadges: result.newBadges,
      level: levelProgress(result.stats.xp).level,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid game";
    res.status(400).json({ error: message });
  }
});

/** Update the user's daily activity goal. */
router.post("/gamification/daily-goal", async (req, res): Promise<void> => {
  const raw = (req.body as { goal?: unknown })?.goal;
  const goal = typeof raw === "number" ? Math.trunc(raw) : NaN;
  if (!Number.isFinite(goal) || goal < 1 || goal > 50) {
    res.status(400).json({ error: "Goal must be between 1 and 50." });
    return;
  }
  const userId = req.userId!;
  await db
    .insert(userStatsTable)
    .values({ userId, dailyGoal: goal })
    .onConflictDoUpdate({
      target: userStatsTable.userId,
      set: { dailyGoal: goal, updatedAt: new Date() },
    });
  res.json({ dailyGoal: goal });
});

/** Top learners by XP, with the viewer's own rank. Identities are anonymized. */
router.get("/gamification/leaderboard", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const rows = await db
    .select()
    .from(userStatsTable)
    .orderBy(desc(userStatsTable.xp))
    .limit(20);

  const leaders = rows.map((r, i) => ({
    rank: i + 1,
    handle: handleForUser(r.userId),
    xp: r.xp,
    level: levelProgress(r.xp).level,
    isMe: r.userId === userId,
  }));

  res.json({ leaders });
});

export default router;
