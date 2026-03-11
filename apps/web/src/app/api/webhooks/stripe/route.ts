import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { getJobPostLimit } from "@/lib/plans";
import type { SubscriptionTier, BillingInterval, SubscriptionStatus } from "@codetalent/db";
import type Stripe from "stripe";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSubscriptionPeriod(sub: Stripe.Subscription) {
  const subAny = sub as unknown as Record<string, unknown>;
  const start = subAny.current_period_start as number | undefined;
  const end = subAny.current_period_end as number | undefined;

  if (start && end) {
    return { start, end };
  }

  // Fallback: check items
  const items = sub.items?.data?.[0];
  if (items) {
    const itemAny = items as unknown as Record<string, unknown>;
    const periodStart = itemAny.current_period_start as number | undefined;
    const periodEnd = itemAny.current_period_end as number | undefined;
    if (periodStart && periodEnd) {
      return { start: periodStart, end: periodEnd };
    }
  }

  // Last fallback
  const created = sub.created ?? Math.floor(Date.now() / 1000);
  return { start: created, end: created + 30 * 24 * 60 * 60 };
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { clientId, tier, billingInterval } = session.metadata ?? {};

      if (!clientId || !tier || !billingInterval) {
        console.error("Missing metadata in checkout session");
        break;
      }

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (!subscriptionId) break;

      const stripeSubResponse =
        await getStripe().subscriptions.retrieve(subscriptionId);
      const stripeSub = stripeSubResponse as unknown as Stripe.Subscription;
      const period = getSubscriptionPeriod(stripeSub);

      await db.clientSubscription.upsert({
        where: { clientId },
        create: {
          clientId,
          tier: tier as SubscriptionTier,
          billingInterval: billingInterval as BillingInterval,
          status: "ACTIVE",
          activeJobPostLimit: getJobPostLimit(tier as SubscriptionTier),
          currentPeriodStart: new Date(period.start * 1000),
          currentPeriodEnd: new Date(period.end * 1000),
          externalCustomerId: session.customer as string,
          externalSubId: subscriptionId,
        },
        update: {
          tier: tier as SubscriptionTier,
          billingInterval: billingInterval as BillingInterval,
          status: "ACTIVE",
          activeJobPostLimit: getJobPostLimit(tier as SubscriptionTier),
          currentPeriodStart: new Date(period.start * 1000),
          currentPeriodEnd: new Date(period.end * 1000),
          externalCustomerId: session.customer as string,
          externalSubId: subscriptionId,
          cancelledAt: null,
        },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceAny = invoice as unknown as Record<string, unknown>;
      const subscriptionId =
        typeof invoiceAny.subscription === "string"
          ? invoiceAny.subscription
          : (invoiceAny.subscription as { id?: string })?.id;

      if (!subscriptionId) break;

      const stripeSubResponse =
        await getStripe().subscriptions.retrieve(subscriptionId);
      const stripeSub = stripeSubResponse as unknown as Stripe.Subscription;
      const period = getSubscriptionPeriod(stripeSub);

      await db.clientSubscription.updateMany({
        where: { externalSubId: subscriptionId },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(period.start * 1000),
          currentPeriodEnd: new Date(period.end * 1000),
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const statusMap: Record<string, SubscriptionStatus> = {
        active: "ACTIVE",
        past_due: "PAST_DUE",
        canceled: "CANCELLED",
        unpaid: "EXPIRED",
      };

      const mappedStatus = statusMap[subscription.status] ?? "ACTIVE";
      const period = getSubscriptionPeriod(subscription);
      const canceledAt = (subscription as unknown as Record<string, unknown>).canceled_at as number | null;

      await db.clientSubscription.updateMany({
        where: { externalSubId: subscription.id },
        data: {
          status: mappedStatus,
          currentPeriodStart: new Date(period.start * 1000),
          currentPeriodEnd: new Date(period.end * 1000),
          cancelledAt: canceledAt ? new Date(canceledAt * 1000) : null,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db.clientSubscription.updateMany({
        where: { externalSubId: subscription.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
