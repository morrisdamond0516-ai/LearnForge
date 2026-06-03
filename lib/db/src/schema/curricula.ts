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

export type CurriculumMaterialData = {
  type: string;
  name: string;
  author: string;
  description: string;
  whereToFind: string;
};

export type CurriculumModuleData = {
  title: string;
  objective: string;
  materials: CurriculumMaterialData[];
};

export const curriculaTable = pgTable("curricula", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  subjectId: integer("subject_id").references(() => subjectsTable.id, {
    onDelete: "set null",
  }),
  subject: text("subject").notNull(),
  level: text("level").notNull().default("Beginner"),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  modules: jsonb("modules")
    .$type<CurriculumModuleData[]>()
    .notNull()
    .default([]),
  nextSteps: text("next_steps").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertCurriculumSchema = createInsertSchema(curriculaTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCurriculum = z.infer<typeof insertCurriculumSchema>;
export type Curriculum = typeof curriculaTable.$inferSelect;
