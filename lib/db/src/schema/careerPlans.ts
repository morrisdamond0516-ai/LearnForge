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
import { documentsTable } from "./documents";

export type SchoolRecommendationData = {
  schoolName: string;
  programName: string;
  degreeLevel: string;
  modality: string;
  location: string;
  estimatedCost: string;
  duration: string;
  whyFit: string;
  highlights: string[];
};

export type CareerPreferencesData = {
  degreeLevel?: string;
  studyMode?: string;
  location?: string;
  budget?: string;
  timeline?: string;
};

export const careerPlansTable = pgTable("career_plans", {
  id: serial("id").primaryKey(),
  careerGoal: text("career_goal").notNull(),
  currentEducation: text("current_education"),
  documentId: integer("document_id").references(() => documentsTable.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  preferences: jsonb("preferences")
    .$type<CareerPreferencesData>()
    .notNull()
    .default({}),
  recommendations: jsonb("recommendations")
    .$type<SchoolRecommendationData[]>()
    .notNull()
    .default([]),
  skillGaps: text("skill_gaps").array().notNull().default([]),
  nextSteps: text("next_steps").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertCareerPlanSchema = createInsertSchema(careerPlansTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCareerPlan = z.infer<typeof insertCareerPlanSchema>;
export type CareerPlan = typeof careerPlansTable.$inferSelect;
