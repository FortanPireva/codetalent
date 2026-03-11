/**
 * Setup Stripe products and prices for Talentflow.
 *
 * Usage:
 *   npx tsx scripts/setup-stripe.ts
 *
 * Requires STRIPE_SECRET_KEY in .env (or pass as env var).
 * Outputs the env vars to paste into your .env file.
 */

import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("STRIPE_SECRET_KEY is required. Set it in .env or pass as env var.");
  process.exit(1);
}

const stripe = new Stripe(secretKey, { typescript: true });

interface PlanDef {
  name: string;
  description: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  envPrefix: string;
}

const plans: PlanDef[] = [
  {
    name: "Talentflow — Starter",
    description: "Up to 3 active job posts, talent pool access, AI code reviews",
    monthlyPriceCents: 7900,
    yearlyPriceCents: 69900,
    envPrefix: "STRIPE_CLIENT_STARTER",
  },
  {
    name: "Talentflow — Growth",
    description: "Up to 10 active job posts, advanced matching, priority support",
    monthlyPriceCents: 19900,
    yearlyPriceCents: 179900,
    envPrefix: "STRIPE_CLIENT_GROWTH",
  },
  {
    name: "Talentflow — Scale",
    description: "Unlimited job posts, dedicated account manager, API access",
    monthlyPriceCents: 49900,
    yearlyPriceCents: 449900,
    envPrefix: "STRIPE_CLIENT_SCALE",
  },
];

async function main() {
  console.log("Creating Stripe products and prices...\n");

  const envLines: string[] = [];

  for (const plan of plans) {
    // Create product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
    });
    console.log(`Created product: ${product.name} (${product.id})`);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.monthlyPriceCents,
      currency: "usd",
      recurring: { interval: "month" },
    });
    console.log(`  Monthly price: $${plan.monthlyPriceCents / 100}/mo (${monthlyPrice.id})`);

    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.yearlyPriceCents,
      currency: "usd",
      recurring: { interval: "year" },
    });
    console.log(`  Yearly price: $${plan.yearlyPriceCents / 100}/yr (${yearlyPrice.id})`);

    envLines.push(`${plan.envPrefix}_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    envLines.push(`${plan.envPrefix}_ANNUAL_PRICE_ID=${yearlyPrice.id}`);
  }

  console.log("\n# Add these to your .env file:\n");
  console.log(envLines.join("\n"));
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
