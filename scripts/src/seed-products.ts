import { getUncachableStripeClient } from "./stripeClient";

/**
 * Seeds the LearnForge plans and their prices in Stripe.
 *
 * Idempotent: re-running will not create duplicates. Prices carry a stable
 * `lookup_key` and a `metadata.plan` key so the server can resolve the real
 * price id at checkout without hardcoding ids.
 *
 * Plans:
 * - LearnForge Pro (18+):    pro_monthly $12.99 / pro_annual $89.99
 * - LearnForge Junior (<18): junior_monthly $3.00 / junior_annual $30.00
 *   (the discounted rate after a minor's 9 free months end)
 *
 * Run with: pnpm --filter @workspace/scripts exec tsx src/seed-products.ts
 */

interface PriceSpec {
  plan: string;
  unitAmount: number;
  interval: "month" | "year";
  label: string;
}

interface ProductSpec {
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: PriceSpec[];
}

const PRODUCTS: ProductSpec[] = [
  {
    name: "LearnForge Pro",
    description:
      "Full access to LearnForge: unlimited AI quizzes, exams, study guides, curricula, career pathways, and mock interviews.",
    metadata: { tier: "pro" },
    prices: [
      { plan: "pro_monthly", unitAmount: 1299, interval: "month", label: "$12.99/month" },
      { plan: "pro_annual", unitAmount: 8999, interval: "year", label: "$89.99/year" },
    ],
  },
  {
    name: "LearnForge Junior",
    description:
      "Discounted plan for learners under 18, after their first 9 months of free access.",
    metadata: { tier: "junior" },
    prices: [
      { plan: "junior_monthly", unitAmount: 300, interval: "month", label: "$3.00/month" },
      { plan: "junior_annual", unitAmount: 3000, interval: "year", label: "$30.00/year" },
    ],
  },
];

async function seedProduct(spec: ProductSpec) {
  const stripe = await getUncachableStripeClient();

  const existing = await stripe.products.search({
    query: `name:'${spec.name}' AND active:'true'`,
  });

  let product = existing.data[0];
  if (product) {
    console.log(`Product exists: ${product.name} (${product.id})`);
  } else {
    product = await stripe.products.create({
      name: spec.name,
      description: spec.description,
      metadata: spec.metadata,
    });
    console.log(`Created product: ${product.name} (${product.id})`);
  }

  for (const p of spec.prices) {
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
}

async function seed() {
  for (const spec of PRODUCTS) {
    await seedProduct(spec);
  }
  console.log("Done. Webhooks will sync these to the database automatically.");
}

seed().catch((err) => {
  console.error("Error seeding products:", err?.message ?? err);
  process.exit(1);
});
