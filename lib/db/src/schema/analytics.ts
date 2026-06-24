import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Raw site-activity events used to power the owner-only Site Stats dashboard.
 * Captures both anonymous visitors (signed-out, identified only by a random
 * client-generated `sessionId`) and signed-in users (`userId` set). Every page
 * view is one row with `eventType = "pageview"`; named product actions
 * (sign-ups, quizzes generated, exams taken, purchases) reuse the same table
 * with a descriptive `eventType` so the dashboard can break down behavior.
 *
 * This is intentionally append-only and lightweight; the retention job prunes
 * old rows so the table never grows unbounded.
 */
export const analyticsEventsTable = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    eventType: text("event_type").notNull(),
    path: text("path"),
    // Anonymous per-browser visitor id (localStorage). Always present so we can
    // count unique visitors even before someone signs in.
    sessionId: text("session_id").notNull(),
    // Clerk user id when the visitor is signed in; null for anonymous traffic.
    userId: text("user_id"),
    referrer: text("referrer"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("analytics_events_created_idx").on(table.createdAt),
    index("analytics_events_session_idx").on(table.sessionId),
    index("analytics_events_type_idx").on(table.eventType),
  ],
);

export const insertAnalyticsEventSchema = createInsertSchema(
  analyticsEventsTable,
).omit({ id: true, createdAt: true });
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;
