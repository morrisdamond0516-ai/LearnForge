import {
  pgTable,
  text,
  serial,
  integer,
  real,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { attemptsTable } from "./attempts";

/**
 * A LearnForge completion certificate earned by passing a certified
 * full-length exam. Certificates auto-expire after a fixed validity window
 * (see CERT_VALID_DAYS in the api-server exam catalog). One certificate per
 * (user, exam) — re-passing renews the existing one with a fresh expiry.
 */
export const certificatesTable = pgTable(
  "certificates",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    examSlug: text("exam_slug").notNull(),
    examName: text("exam_name").notNull(),
    attemptId: integer("attempt_id").references(() => attemptsTable.id, {
      onDelete: "set null",
    }),
    score: real("score").notNull(),
    level: text("level").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("certificates_user_exam_uq").on(table.userId, table.examSlug),
  ],
);

export const insertCertificateSchema = createInsertSchema(certificatesTable).omit(
  {
    id: true,
    issuedAt: true,
  },
);
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificatesTable.$inferSelect;
