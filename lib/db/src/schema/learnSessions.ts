import {
  pgTable,
  text,
  serial,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { subjectsTable } from "./subjects";

export type LearnSectionData = {
  heading: string;
  content: string;
};

export const learnSessionsTable = pgTable("learn_sessions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").references(() => subjectsTable.id, {
    onDelete: "set null",
  }),
  topic: text("topic").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  sections: jsonb("sections")
    .$type<LearnSectionData[]>()
    .notNull()
    .default([]),
  keyPoints: text("key_points").array().notNull().default([]),
  nextSteps: text("next_steps").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertLearnSessionSchema = createInsertSchema(
  learnSessionsTable,
).omit({
  id: true,
  createdAt: true,
});
export type InsertLearnSession = z.infer<typeof insertLearnSessionSchema>;
export type LearnSession = typeof learnSessionsTable.$inferSelect;
