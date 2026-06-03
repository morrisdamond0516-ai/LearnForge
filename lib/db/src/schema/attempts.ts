import {
  pgTable,
  text,
  serial,
  integer,
  real,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { quizzesTable } from "./quizzes";

export type AttemptQuestionResult = {
  questionId: number;
  prompt: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
  explanation: string | null;
};

export const attemptsTable = pgTable("attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzesTable.id, { onDelete: "cascade" }),
  score: real("score").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  level: text("level").notNull().default("Beginner"),
  feedback: text("feedback"),
  results: jsonb("results")
    .$type<AttemptQuestionResult[]>()
    .notNull()
    .default([]),
  completedAt: timestamp("completed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertAttemptSchema = createInsertSchema(attemptsTable).omit({
  id: true,
  completedAt: true,
});
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attemptsTable.$inferSelect;
