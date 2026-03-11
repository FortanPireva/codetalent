import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { SubscriptionTier, BillingInterval } from "@codetalent/db";
import { getStripe } from "@/lib/stripe";
import { PLANS, getStripePriceId, getJobPostLimit } from "@/lib/plans";

export const subscriptionRouter = createTRPCRouter({
  getPlans: publicProcedure.query(() => {
    return PLANS;
  }),

  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const client = await ctx.db.client.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        subscription: true,
        _count: {
          select: {
            jobs: {
              where: { status: { in: ["OPEN", "DRAFT"] } },
            },
          },
        },
      },
    });

    if (!client) {
      return null;
    }

    const subscription = client.subscription;
    const now = new Date();
    const isActive =
      subscription?.status === "ACTIVE" &&
      subscription.currentPeriodEnd > now;
    const daysRemaining = subscription
      ? Math.max(
          0,
          Math.ceil(
            (subscription.currentPeriodEnd.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

    return {
      subscription,
      isActive: isActive ?? false,
      daysRemaining,
      openJobCount: client._count.jobs,
      jobPostLimit: subscription
        ? getJobPostLimit(subscription.tier)
        : 0,
    };
  }),

  createCheckout: protectedProcedure
    .input(
      z.object({
        tier: z.nativeEnum(SubscriptionTier),
        billingInterval: z.nativeEnum(BillingInterval),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.db.client.findUnique({
        where: { userId: ctx.session.user.id },
        include: { subscription: true },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client profile not found",
        });
      }

      // Get or create Stripe customer
      let customerId = client.subscription?.externalCustomerId;
      if (!customerId) {
        const customer = await getStripe().customers.create({
          email: ctx.session.user.email ?? undefined,
          name: client.name,
          metadata: { clientId: client.id },
        });
        customerId = customer.id;
      }

      const priceId = getStripePriceId(input.tier, input.billingInterval);

      const session = await getStripe().checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        allow_promotion_codes: true,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXTAUTH_URL}/client/billing?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
        metadata: {
          clientId: client.id,
          tier: input.tier,
          billingInterval: input.billingInterval,
        },
        subscription_data: {
          metadata: {
            clientId: client.id,
            tier: input.tier,
            billingInterval: input.billingInterval,
          },
        },
      });

      return { url: session.url };
    }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const client = await ctx.db.client.findUnique({
      where: { userId: ctx.session.user.id },
      include: { subscription: true },
    });

    if (!client?.subscription?.externalCustomerId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active subscription found",
      });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: client.subscription.externalCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/client/billing`,
    });

    return { url: session.url };
  }),

  listAll: adminProcedure.query(async ({ ctx }) => {
    const subscriptions = await ctx.db.clientSubscription.findMany({
      include: {
        client: {
          select: { name: true, slug: true, logo: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return subscriptions.map((sub) => {
      const now = new Date();
      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (sub.currentPeriodEnd.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      return { ...sub, daysRemaining };
    });
  }),
});
