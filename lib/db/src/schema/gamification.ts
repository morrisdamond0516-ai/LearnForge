import {
  pgTable,
  text,
  serial,
  integer,
  date,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/** One row per user holding their XP, streak, and daily-goal state. */
export const userStatsTable = pgTable("user_stats", {
  userId: text("user_id").primaryKey(),
  xp: integer("xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  // Last calendar day (UTC, YYYY-MM-DD) the user completed an activity.
  lastActivityDate: date("last_activity_date"),
  // How many activities the user aims to complete each day.
  dailyGoal: integer("daily_goal").notNull().default(3),
  // How many activities the user has completed on `lastActivityDate`.
  todayCount: integer("today_count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertUserStatsSchema = createInsertSchema(userStatsTable);
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStatsTable.$inferSelect;

/** Badges a user has earned. One row per (user, badge). */
export const badgesTable = pgTable(
  "badges",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    badgeKey: text("badge_key").notNull(),
    earnedAt: timestamp("earned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("badges_user_key_uq").on(table.userId, table.badgeKey),
  ],
);

export const insertBadgeSchema = createInsertSchema(badgesTable).omit({
  id: true,
  earnedAt: true,
});
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badgesTable.$inferSelect;
