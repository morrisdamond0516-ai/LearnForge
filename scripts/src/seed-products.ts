import { getUncachableStripeClient } from "./stripeClient";

/**
 * Seeds the LearnForge Pro plan and its prices in Stripe.
 *
 * Idempotent: re-running will not create duplicates. Prices carry a stable
 * `lookup_key` and a `metadata.plan` key ("pro_monthly" / "pro_annual") so the
 * server can resolve the real price id at checkout without hardcoding ids.
 *
 * Run with: pnpm --filter @workspace/scripts exec tsx src/seed-products.ts
 */

const PRO_PLAN_NAME = "LearnForge Pro";

const PRICES = [
  {
    plan: "pro_monthly",
    unitAmount: 1299, // $12.99
    interval: "month" as const,
    label: "$12.99/month",
  },
  {
    plan: "pro_annual",
    unitAmount: 8999, // $89.99
    interval: "year" as const,
    label: "$89.99/year",
  },
];

async function seed() {
  const stripe = await getUncachableStripeClient();

  // Find or create the Pro product.
  const existing = await stripe.products.search({
    query: `name:'${PRO_PLAN_NAME}' AND active:'true'`,
  });

  let product = existing.data[0];
  if (product) {
    console.log(`Product exists: ${product.name} (${product.id})`);
  } else {
    product = await stripe.products.create({
      name: PRO_PLAN_NAME,
      description:
        "Full access to LearnForge: unlimited AI quizzes, exams, study guides, curricula, career pathways, and mock interviews.",
      metadata: { tier: "pro" },
    });
    console.log(`Created product: ${product.name} (${product.id})`);
  }

  for (const p of PRICES) {
    // A price is uniquely identifiable by its lookup_key.
    const found = await stripe.prices.list({
      lookup_keys: [p.plan],
      active: true,
      limit: 1,
    });

    if (found.data[0]) {
      console.log(`Price exists: ${p.plan} -> ${found.data[0].id}`);
      continue;
    }

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.unitAmount,
      currency: "usd",
      recurring: { interval: p.interval },
      lookup_key: p.plan,
      transfer_lookup_key: true,
      metadata: { plan: p.plan },
    });
    console.log(`Created price: ${p.plan} ${p.label} (${price.id})`);
  }

  console.log("Done. Webhooks will sync these to the database automatically.");
}

seed().catch((err) => {
  console.error("Error seeding products:", err?.message ?? err);
  process.exit(1);
});
