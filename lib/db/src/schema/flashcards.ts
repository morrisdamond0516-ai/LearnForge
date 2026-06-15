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

export type FlashcardData = {
  front: string;
  back: string;
};

export const flashcardDecksTable = pgTable("flashcard_decks", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  subjectId: integer("subject_id").references(() => subjectsTable.id, {
    onDelete: "set null",
  }),
  topic: text("topic").notNull(),
  title: text("title").notNull(),
  cards: jsonb("cards").$type<FlashcardData[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertFlashcardDeckSchema = createInsertSchema(
  flashcardDecksTable,
).omit({
  id: true,
  createdAt: true,
});
export type InsertFlashcardDeck = z.infer<typeof insertFlashcardDeckSchema>;
export type FlashcardDeck = typeof flashcardDecksTable.$inferSelect;
