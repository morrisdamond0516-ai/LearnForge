import { db, paypalPurchasesTable } from "@workspace/db";
import { grantProDays } from "./grant";
import type { PayPalPlanKey } from "./paypalService";

/**
 * Persists captured PayPal purchases and grants the resulting Pro entitlement.
 *
 * The purchase ledger is keyed by the PayPal order id (primary key), so
 * recording the purchase and extending entitlement happen in one transaction
 * and are idempotent: a retried or replayed capture for an order that was
 * already recorded grants nothing further (returns `granted: false`), while a
 * first-time capture commits the ledger row and the grant together.
 */
export const paypalStorage = {
  async recordPurchaseAndGrant(args: {
    orderId: string;
    userId: string;
    plan: PayPalPlanKey;
    durationDays: number;
    amount: string;
    currency: string;
    email: string | null;
  }): Promise<{ granted: boolean }> {
    return db.transaction(async (tx) => {
      const inserted = await tx
        .insert(paypalPurchasesTable)
        .values({
          orderId: args.orderId,
          userId: args.userId,
          plan: args.plan,
          durationDays: args.durationDays,
          amount: args.amount,
          currency: args.currency,
        })
        .onConflictDoNothing({ target: paypalPurchasesTable.orderId })
        .returning();

      if (inserted.length === 0) {
        // Order already recorded — idempotent no-op (do not grant twice).
        return { granted: false };
      }

      await grantProDays(tx, args.userId, args.durationDays, args.email);
      return { granted: true };
    });
  },
};
