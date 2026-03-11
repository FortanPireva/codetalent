import { type SubscriptionTier, type BillingInterval } from "@prisma/client";

export interface Plan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number; // cents
  yearlyPrice: number; // cents
  activeJobPostLimit: number; // -1 = unlimited
  features: string[];
  recommended: boolean;
}

export const PLANS: Plan[] = [
  {
    tier: "STARTER",
    name: "Starter",
    description: "Perfect for small teams hiring their first engineers",
    monthlyPrice: 7900,
    yearlyPrice: 69900,
    activeJobPostLimit: 3,
    features: [
      "Up to 3 active job posts",
      "Access to talent pool",
      "AI-powered code reviews",
      "Candidate matching",
      "Email support",
    ],
    recommended: false,
  },
  {
    tier: "GROWTH",
    name: "Growth",
    description: "For growing teams with ongoing hiring needs",
    monthlyPrice: 19900,
    yearlyPrice: 179900,
    activeJobPostLimit: 10,
    features: [
      "Up to 10 active job posts",
      "Access to talent pool",
      "AI-powered code reviews",
      "Advanced candidate matching",
      "Priority support",
      "Hiring analytics dashboard",
    ],
    recommended: true,
  },
  {
    tier: "SCALE",
    name: "Scale",
    description: "For large organizations with high-volume hiring",
    monthlyPrice: 49900,
    yearlyPrice: 449900,
    activeJobPostLimit: -1,
    features: [
      "Unlimited active job posts",
      "Access to talent pool",
      "AI-powered code reviews",
      "Advanced candidate matching",
      "Dedicated account manager",
      "Hiring analytics dashboard",
      "Custom assessments",
      "API access",
    ],
    recommended: false,
  },
];

export function getPlanByTier(tier: SubscriptionTier): Plan | undefined {
  return PLANS.find((p) => p.tier === tier);
}

export function getJobPostLimit(tier: SubscriptionTier): number {
  const plan = getPlanByTier(tier);
  return plan?.activeJobPostLimit ?? 3;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

const STRIPE_PRICE_MAP: Record<string, string | undefined> = {
  "STARTER_MONTHLY": process.env.STRIPE_CLIENT_STARTER_MONTHLY_PRICE_ID,
  "STARTER_YEARLY": process.env.STRIPE_CLIENT_STARTER_ANNUAL_PRICE_ID,
  "GROWTH_MONTHLY": process.env.STRIPE_CLIENT_GROWTH_MONTHLY_PRICE_ID,
  "GROWTH_YEARLY": process.env.STRIPE_CLIENT_GROWTH_ANNUAL_PRICE_ID,
  "SCALE_MONTHLY": process.env.STRIPE_CLIENT_SCALE_MONTHLY_PRICE_ID,
  "SCALE_YEARLY": process.env.STRIPE_CLIENT_SCALE_ANNUAL_PRICE_ID,
};

export function getStripePriceId(
  tier: SubscriptionTier,
  interval: BillingInterval
): string {
  const key = `${tier}_${interval}`;
  const priceId = STRIPE_PRICE_MAP[key];
  if (!priceId) {
    throw new Error(`No Stripe price ID configured for ${key}`);
  }
  return priceId;
}
