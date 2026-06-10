import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * Durable ledger of captured PayPal one-time purchases, keyed by the PayPal
 * order id. The unique primary key makes entitlement granting idempotent: a
 * replayed or retried capture for the same order can never grant Pro twice.
 * Recording the purchase and extending the user's `pro_until` happen in a single
 * transaction, so a partial failure never leaves a captured payment ungranted.
 */
export const paypalPurchasesTable = pgTable("paypal_purchases", {
  orderId: text("order_id").primaryKey(),
  userId: text("user_id").notNull(),
  plan: text("plan").notNull(),
  durationDays: integer("duration_days").notNull(),
  amount: text("amount").notNull(),
  currency: text("currency").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PaypalPurchase = typeof paypalPurchasesTable.$inferSelect;
