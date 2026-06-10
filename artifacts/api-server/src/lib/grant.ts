import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

/**
 * A Drizzle transaction handle (same query-builder surface as `db`). Both the
 * access-code redemption and the PayPal capture paths grant Pro time inside a
 * transaction so the grant commits atomically with whatever consumed it (the
 * claimed code / the recorded purchase).
 */
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Extend a user's Pro entitlement by `days`, creating the user link row first if
 * needed. Uses GREATEST(proUntil, now()) so adding time to an already-active
 * (future) entitlement stacks onto the remaining time rather than truncating it.
 * Must be called inside a transaction (`tx`) together with the operation that
 * authorizes the grant.
 */
export async function grantProDays(
  tx: Tx,
  userId: string,
  days: number,
  email: string | null,
): Promise<void> {
  await tx
    .insert(usersTable)
    .values({ id: userId, email })
    .onConflictDoNothing({ target: usersTable.id });

  await tx
    .update(usersTable)
    .set({
      proUntil: sql`GREATEST(COALESCE(${usersTable.proUntil}, now()), now()) + (${days} * interval '1 day')`,
    })
    .where(eq(usersTable.id, userId));
}
