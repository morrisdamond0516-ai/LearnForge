import {
  db,
  userStatsTable,
  badgesTable,
  type UserStats,
} from "@workspace/db";
import { sql } from "drizzle-orm";

/** XP required to advance one level (linear, easy to display). */
export const XP_PER_LEVEL = 250;

export function levelForXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  pct: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    xpIntoLevel,
    xpForLevel: XP_PER_LEVEL,
    pct: Math.round((xpIntoLevel / XP_PER_LEVEL) * 100),
  };
}

export interface BadgeDef {
  key: string;
  name: string;
  description: string;
}

/** Static badge catalog. Criteria are evaluated in `evaluateBadges`. */
export const BADGE_CATALOG: BadgeDef[] = [
  { key: "first_quiz", name: "First Steps", description: "Complete your first test." },
  { key: "streak_3", name: "On a Roll", description: "Keep a 3-day learning streak." },
  { key: "streak_7", name: "Week Warrior", description: "Keep a 7-day learning streak." },
  { key: "streak_30", name: "Unstoppable", description: "Keep a 30-day learning streak." },
  { key: "perfect", name: "Perfectionist", description: "Score 100% on a test." },
  { key: "goal_met", name: "Goal Getter", description: "Hit your daily goal." },
  { key: "xp_500", name: "Rising Star", description: "Earn 500 XP." },
  { key: "xp_2000", name: "Scholar", description: "Earn 2000 XP." },
  { key: "xp_5000", name: "Mastermind", description: "Earn 5000 XP." },
  { key: "first_game", name: "Player One", description: "Complete your first learning game." },
  { key: "boss_slayer", name: "Boss Slayer", description: "Defeat all knowledge bosses." },
  { key: "career_explorer", name: "Career Explorer", description: "Finish a Career Life Quest story." },
  { key: "pro_sim", name: "Pro in Training", description: "Complete a Day One on the Job simulation." },
  { key: "lab_hero", name: "Lab Hero", description: "Escape the science lab." },
  { key: "showtime", name: "Showtime", description: "Clear a full Jeopardy Arena board." },
  { key: "career_match", name: "Party Planner", description: "Complete Career Match Party." },
  { key: "mission_ace", name: "Mission Ace", description: "Finish a Skills Mission track." },
  { key: "path_finder", name: "Path Finder", description: "Complete Future Path Finder." },
  { key: "fact_checker", name: "Fact Checker", description: "Finish a Fact or Fiction round." },
  { key: "step_master", name: "Step Master", description: "Complete Step Sorter." },
  { key: "lightning_brain", name: "Lightning Brain", description: "Finish a Lightning Quiz round." },
  { key: "quiz_star", name: "Quiz Star", description: "Complete a Quiz Show round." },
  { key: "survivor", name: "Survivor", description: "Clear Survival Run without losing all lives." },
  { key: "career_tycoon", name: "Career Tycoon", description: "Finish a Career Cash round." },
  { key: "skill_builder", name: "Skill Builder", description: "Complete a Career Skills Lab game." },
  { key: "school_skills", name: "School Skills", description: "Complete a School Skills Lab game." },
];

const CAREER_SKILL_PREFIX = "career-skill-";
const EDU_SKILL_PREFIX = "edu-skill-";

function isCareerSkillGame(gameId: string): boolean {
  return gameId.startsWith(CAREER_SKILL_PREFIX) && gameId.length > CAREER_SKILL_PREFIX.length;
}

function isEduSkillGame(gameId: string): boolean {
  return gameId.startsWith(EDU_SKILL_PREFIX) && gameId.length > EDU_SKILL_PREFIX.length;
}

function isSkillLabGame(gameId: string): boolean {
  return isCareerSkillGame(gameId) || isEduSkillGame(gameId);
}

const VALID_GAME_IDS = new Set([
  "math-sprint",
  "word-scramble",
  "memory-match",
  "career-sorter",
  "science-trivia",
  "geography-capitals",
  "boss-battle",
  "career-quest",
  "lab-escape",
  "jeopardy-arena",
  "day-on-the-job",
  "career-match-party",
  "skills-missions",
  "future-path-finder",
  "fact-or-fiction",
  "step-sorter",
  "lightning-quiz",
  "quiz-show",
  "survival-run",
  "career-cash",
  "career-skills-lab",
  "education-skills-lab",
]);

const FEATURED_GAMES = new Set([
  "education-skills-lab",
  "career-skills-lab",
  "boss-battle",
  "career-quest",
  "lab-escape",
  "jeopardy-arena",
  "day-on-the-job",
  "career-match-party",
  "skills-missions",
  "future-path-finder",
]);

const GAME_BADGE_BY_ID: Record<string, string> = {
  "boss-battle": "boss_slayer",
  "career-quest": "career_explorer",
  "day-on-the-job": "pro_sim",
  "lab-escape": "lab_hero",
  "jeopardy-arena": "showtime",
  "career-match-party": "career_match",
  "skills-missions": "mission_ace",
  "future-path-finder": "path_finder",
  "fact-or-fiction": "fact_checker",
  "step-sorter": "step_master",
  "lightning-quiz": "lightning_brain",
  "quiz-show": "quiz_star",
  "career-cash": "career_tycoon",
};

function isValidGameId(gameId: string): boolean {
  return VALID_GAME_IDS.has(gameId) || isSkillLabGame(gameId);
}

const BADGE_KEYS = new Set(BADGE_CATALOG.map((b) => b.key));

/** UTC calendar day as YYYY-MM-DD. */
function utcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface ActivityOutcome {
  correctCount: number;
  totalQuestions: number;
  score: number;
}

export interface ActivityResult {
  stats: UserStats;
  xpAwarded: number;
  newBadges: BadgeDef[];
}

/** XP for one completed test: a base reward plus correctness and a perfect bonus. */
function xpForOutcome(o: ActivityOutcome): number {
  const base = 10;
  const perCorrect = o.correctCount * 5;
  const perfect = o.totalQuestions > 0 && o.score >= 100 ? 25 : 0;
  return base + perCorrect + perfect;
}

export interface GameOutcome {
  gameId: string;
  scorePct?: number;
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** XP for a completed learning game. Featured adventures pay more. */
function xpForGame(outcome: GameOutcome): number {
  if (!isValidGameId(outcome.gameId)) return 0;
  const featured =
    FEATURED_GAMES.has(outcome.gameId) || isSkillLabGame(outcome.gameId);
  const base = featured ? 45 : 15;
  const pct = clampPct(outcome.scorePct ?? (featured ? 70 : 50));
  const bonusMax = featured ? 25 : 10;
  return base + Math.round((pct / 100) * bonusMax);
}

async function upsertUserActivity(
  userId: string,
  xpAwarded: number,
  now: Date,
): Promise<UserStats> {
  const today = utcDay(now);
  const yesterday = utcDay(new Date(now.getTime() - 86400000));

  const streakExpr = sql<number>`CASE
      WHEN ${userStatsTable.lastActivityDate} = ${today} THEN ${userStatsTable.currentStreak}
      WHEN ${userStatsTable.lastActivityDate} = ${yesterday} THEN ${userStatsTable.currentStreak} + 1
      ELSE 1 END`;

  const [stats] = await db
    .insert(userStatsTable)
    .values({
      userId,
      xp: xpAwarded,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
      todayCount: 1,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userStatsTable.userId,
      set: {
        xp: sql`${userStatsTable.xp} + ${xpAwarded}`,
        todayCount: sql`CASE WHEN ${userStatsTable.lastActivityDate} = ${today}
          THEN ${userStatsTable.todayCount} + 1 ELSE 1 END`,
        currentStreak: streakExpr,
        longestStreak: sql`GREATEST(${userStatsTable.longestStreak}, ${streakExpr})`,
        lastActivityDate: today,
        updatedAt: now,
      },
    })
    .returning();

  return stats;
}

async function grantBadgeKeys(
  userId: string,
  earnedKeys: Set<string>,
): Promise<BadgeDef[]> {
  const newBadges: BadgeDef[] = [];
  for (const key of earnedKeys) {
    if (!BADGE_KEYS.has(key)) continue;
    const inserted = await db
      .insert(badgesTable)
      .values({ userId, badgeKey: key })
      .onConflictDoNothing({
        target: [badgesTable.userId, badgesTable.badgeKey],
      })
      .returning();
    if (inserted.length > 0) {
      const def = BADGE_CATALOG.find((b) => b.key === key);
      if (def) newBadges.push(def);
    }
  }
  return newBadges;
}

function quizBadgeKeys(
  stats: UserStats,
  outcome: ActivityOutcome,
): Set<string> {
  const earnedKeys = new Set<string>();
  earnedKeys.add("first_quiz");
  if (stats.currentStreak >= 3) earnedKeys.add("streak_3");
  if (stats.currentStreak >= 7) earnedKeys.add("streak_7");
  if (stats.currentStreak >= 30) earnedKeys.add("streak_30");
  if (outcome.totalQuestions > 0 && outcome.score >= 100) earnedKeys.add("perfect");
  if (stats.todayCount >= stats.dailyGoal) earnedKeys.add("goal_met");
  if (stats.xp >= 500) earnedKeys.add("xp_500");
  if (stats.xp >= 2000) earnedKeys.add("xp_2000");
  if (stats.xp >= 5000) earnedKeys.add("xp_5000");
  return earnedKeys;
}

function gameBadgeKeys(
  stats: UserStats,
  gameId: string,
  scorePct?: number,
): Set<string> {
  const earnedKeys = new Set<string>();
  earnedKeys.add("first_game");
  const gameBadge = GAME_BADGE_BY_ID[gameId];
  if (gameBadge) earnedKeys.add(gameBadge);
  if (gameId === "survival-run" && (scorePct ?? 0) >= 100) {
    earnedKeys.add("survivor");
  }
  if (isCareerSkillGame(gameId)) earnedKeys.add("skill_builder");
  if (isEduSkillGame(gameId)) earnedKeys.add("school_skills");
  if (stats.currentStreak >= 3) earnedKeys.add("streak_3");
  if (stats.currentStreak >= 7) earnedKeys.add("streak_7");
  if (stats.currentStreak >= 30) earnedKeys.add("streak_30");
  if (stats.todayCount >= stats.dailyGoal) earnedKeys.add("goal_met");
  if (stats.xp >= 500) earnedKeys.add("xp_500");
  if (stats.xp >= 2000) earnedKeys.add("xp_2000");
  if (stats.xp >= 5000) earnedKeys.add("xp_5000");
  return earnedKeys;
}

/**
 * Record a completed learning activity: award XP, update the daily streak and
 * daily-goal counter, and grant any newly-earned badges. Atomic per user via an
 * upsert; callers should treat failures as non-fatal.
 */
export async function recordActivity(
  userId: string,
  outcome: ActivityOutcome,
  now: Date = new Date(),
): Promise<ActivityResult> {
  const xpAwarded = xpForOutcome(outcome);
  const stats = await upsertUserActivity(userId, xpAwarded, now);
  const newBadges = await grantBadgeKeys(
    userId,
    quizBadgeKeys(stats, outcome),
  );
  return { stats, xpAwarded, newBadges };
}

/** Record a completed learning game: award XP, streak credit, and game badges. */
export async function recordGameActivity(
  userId: string,
  outcome: GameOutcome,
  now: Date = new Date(),
): Promise<ActivityResult> {
  if (!isValidGameId(outcome.gameId)) {
    throw new Error("Unknown game id");
  }
  const xpAwarded = xpForGame(outcome);
  const stats = await upsertUserActivity(userId, xpAwarded, now);
  const newBadges = await grantBadgeKeys(
    userId,
    gameBadgeKeys(stats, outcome.gameId, outcome.scorePct),
  );
  return { stats, xpAwarded, newBadges };
}

/** Stable, non-PII display handle for a user (for the leaderboard). */
export function handleForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const suffix = hash.toString(36).toUpperCase().slice(0, 4).padStart(4, "0");
  return `Learner-${suffix}`;
}

export { sql };
