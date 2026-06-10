/**
 * Self-serve bulk pricing for schools / educators. This is the SOURCE OF TRUTH
 * for what a bulk purchase costs — the server always recomputes the price here
 * from the requested plan + quantity, so the client cannot tamper with totals.
 *
 * The deal: a per-seat price that drops as the school buys more seats (volume
 * discount). Each seat is a one-time purchase that yields ONE redeemable access
 * code granting `durationDays` of Pro (no auto-renew).
 *
 * If you want to change the deal, edit the tiers/prices below. Keep the client
 * display table in `pricing.tsx` in sync (it is indicative only — this file wins
 * at checkout).
 */

export type SchoolPlanKey = "school_semester" | "school_year";

export const MIN_SEATS = 5;
export const MAX_SEATS = 5000;

interface Tier {
  /** Applies when quantity >= minQty (pick the highest matching tier). */
  minQty: number;
  perSeatCents: number;
}

interface SchoolPlanDef {
  durationDays: number;
  label: string;
  currency: string;
  /** Ascending by minQty. */
  tiers: Tier[];
}

export const SCHOOL_PLANS: Record<SchoolPlanKey, SchoolPlanDef> = {
  school_semester: {
    durationDays: 180,
    label: "Semester (6 months)",
    currency: "usd",
    tiers: [
      { minQty: 5, perSeatCents: 3599 },
      { minQty: 25, perSeatCents: 2999 },
      { minQty: 100, perSeatCents: 2399 },
      { minQty: 300, perSeatCents: 1799 },
    ],
  },
  school_year: {
    durationDays: 365,
    label: "Full year (12 months)",
    currency: "usd",
    tiers: [
      { minQty: 5, perSeatCents: 5999 },
      { minQty: 25, perSeatCents: 4999 },
      { minQty: 100, perSeatCents: 3999 },
      { minQty: 300, perSeatCents: 2999 },
    ],
  },
};

export function isSchoolPlan(value: unknown): value is SchoolPlanKey {
  return value === "school_semester" || value === "school_year";
}

export interface SchoolQuote {
  plan: SchoolPlanKey;
  quantity: number;
  durationDays: number;
  perSeatCents: number;
  totalCents: number;
  currency: string;
  label: string;
}

/**
 * Resolve the authoritative quote for a plan + seat count. Returns null when the
 * quantity is out of the allowed range. Picks the best (highest-minQty) tier the
 * quantity qualifies for.
 */
export function getSchoolQuote(
  plan: SchoolPlanKey,
  quantity: number,
): SchoolQuote | null {
  if (!Number.isInteger(quantity)) return null;
  if (quantity < MIN_SEATS || quantity > MAX_SEATS) return null;

  const def = SCHOOL_PLANS[plan];
  let perSeatCents = def.tiers[0].perSeatCents;
  for (const tier of def.tiers) {
    if (quantity >= tier.minQty) perSeatCents = tier.perSeatCents;
  }

  return {
    plan,
    quantity,
    durationDays: def.durationDays,
    perSeatCents,
    totalCents: perSeatCents * quantity,
    currency: def.currency,
    label: def.label,
  };
}
