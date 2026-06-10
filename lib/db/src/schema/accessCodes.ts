import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Redeemable access codes. Sponsors / schools obtain codes (issued via the mint
 * script after they pay through any channel — including in countries Stripe does
 * not fully cover) and hand them to students, who redeem a code to receive a Pro
 * entitlement for `durationDays` (applied to `users.proUntil`).
 *
 * A code is single-use: redemption flips `status` to "redeemed" and stamps who
 * redeemed it and when. Codes can be pre-expired with `expiresAt`.
 */
export const accessCodesTable = pgTable("access_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // Human-friendly, case-insensitive code (stored uppercased), e.g. LF-7K2D-9QXM.
  code: text("code").notNull().unique(),
  // How many days of Pro this code grants on redemption.
  durationDays: integer("duration_days").notNull(),
  // Free-form label for tracking (sponsor / school name, batch, etc.).
  note: text("note"),
  // "active" | "redeemed" | "revoked".
  status: text("status").notNull().default("active"),
  redeemedByUserId: text("redeemed_by_user_id"),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
  // Optional: a code unredeemed past this instant can no longer be used.
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertAccessCodeSchema = createInsertSchema(accessCodesTable).omit({
  id: true,
  status: true,
  redeemedByUserId: true,
  redeemedAt: true,
  createdAt: true,
});

export type InsertAccessCode = z.infer<typeof insertAccessCodeSchema>;
export type AccessCode = typeof accessCodesTable.$inferSelect;
