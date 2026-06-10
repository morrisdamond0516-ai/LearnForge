import { db, bulkOrdersTable, accessCodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { SchoolPlanKey } from "./schoolPricing";

// Unambiguous alphabet (no 0/O/1/I) to avoid transcription errors.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomGroup(len: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

function generateCode(): string {
  return `LF-${randomGroup(4)}-${randomGroup(4)}`;
}

export interface BulkOrderResult {
  quantity: number;
  durationDays: number;
  plan: SchoolPlanKey;
  amountTotalCents: number;
  currency: string;
  codes: string[];
}

/**
 * Persists self-serve school bulk orders and mints the redeemable access codes.
 *
 * Minting is idempotent and atomic, keyed by the Stripe Checkout session id:
 * recording the order row and inserting all codes happen in one transaction, and
 * a replayed verification of the same paid session returns the already-minted
 * codes instead of minting a second batch.
 */
export const schoolStorage = {
  /**
   * Mint codes for a paid order if not already done, else return existing codes.
   * Returns "forbidden" if the order exists but belongs to another user.
   */
  async recordOrderAndMint(args: {
    sessionId: string;
    buyerUserId: string;
    buyerEmail: string | null;
    plan: SchoolPlanKey;
    quantity: number;
    durationDays: number;
    amountTotalCents: number;
    currency: string;
  }): Promise<BulkOrderResult | "forbidden"> {
    return db.transaction(async (tx) => {
      const inserted = await tx
        .insert(bulkOrdersTable)
        .values({
          sessionId: args.sessionId,
          buyerUserId: args.buyerUserId,
          buyerEmail: args.buyerEmail,
          plan: args.plan,
          quantity: args.quantity,
          durationDays: args.durationDays,
          amountTotalCents: args.amountTotalCents,
          currency: args.currency,
        })
        .onConflictDoNothing({ target: bulkOrdersTable.sessionId })
        .returning();

      if (inserted.length === 0) {
        // Already recorded — return the existing batch (idempotent).
        const [existing] = await tx
          .select()
          .from(bulkOrdersTable)
          .where(eq(bulkOrdersTable.sessionId, args.sessionId));
        if (!existing) {
          // Should be unreachable: the insert reported a conflict, so a row
          // exists. Treat a missing row as a transient error rather than
          // dereferencing undefined.
          throw new Error("Order row vanished after conflict");
        }
        if (existing.buyerUserId !== args.buyerUserId) {
          return "forbidden";
        }
        const rows = await tx
          .select({ code: accessCodesTable.code })
          .from(accessCodesTable)
          .where(eq(accessCodesTable.batchId, args.sessionId));
        return {
          quantity: existing.quantity,
          durationDays: existing.durationDays,
          plan: existing.plan as SchoolPlanKey,
          amountTotalCents: existing.amountTotalCents,
          currency: existing.currency,
          codes: rows.map((r) => r.code),
        };
      }

      // First time: mint `quantity` unique codes within the same transaction.
      const codes: string[] = [];
      const note = args.buyerEmail ?? "School bulk";
      for (let guard = 0; guard < 10 && codes.length < args.quantity; guard++) {
        const need = args.quantity - codes.length;
        const seen = new Set<string>();
        const values: Array<{
          code: string;
          durationDays: number;
          note: string;
          batchId: string;
        }> = [];
        while (values.length < need) {
          const code = generateCode();
          if (seen.has(code)) continue;
          seen.add(code);
          values.push({
            code,
            durationDays: args.durationDays,
            note,
            batchId: args.sessionId,
          });
        }
        const ins = await tx
          .insert(accessCodesTable)
          .values(values)
          .onConflictDoNothing({ target: accessCodesTable.code })
          .returning({ code: accessCodesTable.code });
        for (const r of ins) codes.push(r.code);
      }

      if (codes.length !== args.quantity) {
        throw new Error("Could not mint the full batch of access codes");
      }

      return {
        quantity: args.quantity,
        durationDays: args.durationDays,
        plan: args.plan,
        amountTotalCents: args.amountTotalCents,
        currency: args.currency,
        codes,
      };
    });
  },
};
