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

export type LessonCheckQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type LessonSectionData = {
  heading: string;
  content: string;
  example: string;
  checkQuestion: LessonCheckQuestion;
};

export type LessonKeyTermData = {
  term: string;
  definition: string;
};

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  subjectId: integer("subject_id").references(() => subjectsTable.id, {
    onDelete: "set null",
  }),
  topic: text("topic").notNull(),
  level: text("level").notNull().default("Beginner"),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  sections: jsonb("sections")
    .$type<LessonSectionData[]>()
    .notNull()
    .default([]),
  keyTerms: jsonb("key_terms")
    .$type<LessonKeyTermData[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type LessonRow = typeof lessonsTable.$inferSelect;
