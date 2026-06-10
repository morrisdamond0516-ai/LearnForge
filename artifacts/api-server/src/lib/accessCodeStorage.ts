import { db, accessCodesTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { grantProDays } from "./grant";

/**
 * Reads and redeems redeemable access codes, and applies the resulting Pro
 * entitlement onto the application `users` table (`pro_until`).
 *
 * Redemption is atomic: the guarded claim (active, unredeemed, not expired) and
 * the entitlement grant run in a single transaction, so a code can never be
 * claimed twice (even under concurrency) and a claimed code can never be left
 * without its Pro grant — either both commit or neither does.
 */
export const accessCodeStorage = {
  /** Normalize user input to the stored form (uppercase, trimmed). */
  normalize(code: string): string {
    return code.trim().toUpperCase();
  },

  async findByCode(code: string) {
    const [row] = await db
      .select()
      .from(accessCodesTable)
      .where(eq(accessCodesTable.code, this.normalize(code)));
    return row ?? null;
  },

  /**
   * Atomically claim a code for a user AND grant the Pro entitlement in one
   * transaction. Returns the granted duration, or null if the code does not
   * exist, was already redeemed/revoked, or has expired (the race-loser case).
   */
  async redeem(
    code: string,
    userId: string,
    email: string | null,
  ): Promise<{ durationDays: number } | null> {
    const normalized = this.normalize(code);
    return db.transaction(async (tx) => {
      const [row] = await tx
        .update(accessCodesTable)
        .set({
          status: "redeemed",
          redeemedByUserId: userId,
          redeemedAt: new Date(),
        })
        .where(
          and(
            eq(accessCodesTable.code, normalized),
            eq(accessCodesTable.status, "active"),
            sql`(${accessCodesTable.expiresAt} IS NULL OR ${accessCodesTable.expiresAt} > now())`,
          ),
        )
        .returning();

      if (!row) return null;

      await grantProDays(tx, userId, row.durationDays, email);
      return { durationDays: row.durationDays };
    });
  },
};
