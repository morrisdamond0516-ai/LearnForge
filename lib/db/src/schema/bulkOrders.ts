import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * Self-serve bulk seat purchases by schools / educators. One row per paid Stripe
 * Checkout session (primary key = the session id), which makes code minting
 * idempotent: verifying the same paid session again never mints a second batch.
 *
 * On the first verified-paid load, the server mints `quantity` access codes (each
 * granting `durationDays` of Pro) tagged with this `sessionId` as their
 * `batchId`, all inside one transaction with the order row. The buyer
 * (`buyerUserId`) is the only user allowed to view the resulting codes.
 */
export const bulkOrdersTable = pgTable("bulk_orders", {
  sessionId: text("session_id").primaryKey(),
  buyerUserId: text("buyer_user_id").notNull(),
  buyerEmail: text("buyer_email"),
  plan: text("plan").notNull(),
  quantity: integer("quantity").notNull(),
  durationDays: integer("duration_days").notNull(),
  amountTotalCents: integer("amount_total_cents").notNull(),
  currency: text("currency").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type BulkOrder = typeof bulkOrdersTable.$inferSelect;
