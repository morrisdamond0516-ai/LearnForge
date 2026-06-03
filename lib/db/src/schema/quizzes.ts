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
import { documentsTable } from "./documents";

export type QuizQuestion = {
  id: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  order: number;
};

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  title: text("title").notNull(),
  mode: text("mode").notNull().default("practice"),
  subjectId: integer("subject_id").references(() => subjectsTable.id, {
    onDelete: "set null",
  }),
  documentId: integer("document_id").references(() => documentsTable.id, {
    onDelete: "set null",
  }),
  topic: text("topic"),
  career: text("career"),
  difficulty: text("difficulty").notNull().default("medium"),
  questionCount: integer("question_count").notNull().default(0),
  questions: jsonb("questions").$type<QuizQuestion[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzesTable.$inferSelect;
