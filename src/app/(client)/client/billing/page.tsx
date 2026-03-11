"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, formatPrice } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { type SubscriptionTier, type BillingInterval } from "@prisma/client";
import {
  Check,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const { update } = useSession();
  const searchParams = useSearchParams();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("MONTHLY");

  // After Stripe checkout redirect, refresh the JWT so middleware picks up the subscription
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      update();
    }
  }, [searchParams, update]);

  const { data: status, isLoading } = api.subscription.getStatus.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  const checkoutMutation = api.subscription.createCheckout.useMutation({
    onSuccess: async (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const portalMutation = api.subscription.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubscribe = (tier: SubscriptionTier) => {
    checkoutMutation.mutate({ tier, billingInterval });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const subscription = status?.subscription;
  const isActive = status?.isActive;

  // Active subscription view
  if (subscription && isActive) {
    const plan = PLANS.find((p) => p.tier === subscription.tier);

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and billing details
          </p>
        </div>

        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">
                  {plan?.name ?? subscription.tier} Plan
                </CardTitle>
                <CardDescription>
                  {subscription.billingInterval === "YEARLY"
                    ? "Billed annually"
                    : "Billed monthly"}
                </CardDescription>
              </div>
              <Badge
                variant="default"
                className="rounded-md text-[10px] font-bold uppercase tracking-wide"
              >
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Period Ends</p>
                <p className="font-medium mt-1">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="font-medium mt-1">{status.daysRemaining}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Job Posts</p>
                <p className="font-medium mt-1">
                  {status.openJobCount} /{" "}
                  {status.jobPostLimit === -1
                    ? "Unlimited"
                    : status.jobPostLimit}
                </p>
              </div>
            </div>

            {plan && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Plan Features</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-foreground/50" strokeWidth={2.5} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-border/60">
              <Button
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                variant="outline"
                className="border-foreground/20 hover:bg-foreground/5"
              >
                {portalMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No subscription / cancelled / expired — show plan selection
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {subscription ? "Reactivate Your Subscription" : "Choose Your Plan"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {subscription
            ? "Your subscription has ended. Pick a plan to continue."
            : "Subscribe to start posting jobs and accessing the talent pool."}
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setBillingInterval("MONTHLY")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              billingInterval === "MONTHLY"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("YEARLY")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              billingInterval === "YEARLY"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yearly (Save 26%)
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const price =
            billingInterval === "YEARLY"
              ? Math.round(plan.yearlyPrice / 12)
              : plan.monthlyPrice;

          return (
            <div
              key={plan.tier}
              className={cn(
                "relative rounded-xl border p-6 transition-all duration-200",
                plan.recommended
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/60 hover:border-foreground/30"
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-background text-foreground font-bold text-[10px] tracking-wide uppercase rounded-md px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-[0.15em]",
                  plan.recommended ? "text-background/60" : "text-muted-foreground"
                )}
              >
                {plan.name}
              </p>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {formatPrice(price)}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    plan.recommended ? "text-background/50" : "text-muted-foreground"
                  )}
                >
                  /mo
                </span>
              </div>

              <p
                className={cn(
                  "mt-3 text-sm",
                  plan.recommended ? "text-background/70" : "text-muted-foreground"
                )}
              >
                {plan.description}
              </p>

              <Button
                onClick={() => handleSubscribe(plan.tier)}
                disabled={checkoutMutation.isPending}
                className={cn(
                  "w-full mt-5 font-medium",
                  plan.recommended
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "bg-foreground text-background hover:bg-foreground/85"
                )}
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Subscribe
              </Button>

              <ul className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 mt-0.5 shrink-0",
                        plan.recommended ? "text-background/60" : "text-foreground/50"
                      )}
                      strokeWidth={2.5}
                    />
                    <span
                      className={cn(
                        "text-xs",
                        plan.recommended ? "text-background/80" : "text-foreground/80"
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Have a founding client code? Enter it at checkout for free access.
      </p>
    </div>
  );
}
