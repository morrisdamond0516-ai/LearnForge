import {
  pgTable,
  text,
  serial,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { subjectsTable } from "./subjects";
import { documentsTable } from "./documents";
import { curriculaTable } from "./curricula";

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
  curriculumId: integer("curriculum_id").references(() => curriculaTable.id, {
    onDelete: "set null",
  }),
  moduleIndex: integer("module_index"),
  topic: text("topic"),
  career: text("career"),
  examSlug: text("exam_slug"),
  difficulty: text("difficulty").notNull().default("medium"),
  questionCount: integer("question_count").notNull().default(0),
  questions: jsonb("questions").$type<QuizQuestion[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("quizzes_user_curriculum_module_uq")
    .on(table.userId, table.curriculumId, table.moduleIndex)
    .where(
      sql`${table.userId} IS NOT NULL AND ${table.curriculumId} IS NOT NULL AND ${table.moduleIndex} IS NOT NULL`,
    ),
]);

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzesTable.$inferSelect;
