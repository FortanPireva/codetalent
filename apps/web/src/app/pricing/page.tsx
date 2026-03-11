"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/app/_components/landing/navbar";
import { Footer } from "@/app/_components/landing/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, formatPrice } from "@/lib/plans";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Pricing
            </p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
              Hire better engineers,
              <br />
              faster.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground font-normal max-w-xl mx-auto">
              Simple, transparent pricing. Choose the plan that fits your hiring
              volume. All plans include AI-powered code assessments.
            </p>

            {/* Billing Toggle */}
            <div className="mt-10 inline-flex items-center gap-3 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={cn(
                  "px-5 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  !isYearly
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={cn(
                  "px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  isYearly
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Yearly
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-bold tracking-wide rounded-md border-foreground/20",
                    isYearly && "border-background/30 text-background"
                  )}
                >
                  Save 26%
                </Badge>
              </button>
            </div>
          </div>
        </section>

        {/* Plan Cards */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const perMonth = isYearly
                ? Math.round(plan.yearlyPrice / 12)
                : plan.monthlyPrice;

              return (
                <div
                  key={plan.tier}
                  className={cn(
                    "relative rounded-xl border transition-all duration-200",
                    plan.recommended
                      ? "border-foreground bg-foreground text-background ring-1 ring-foreground scale-[1.02] md:scale-105 z-10"
                      : "border-border/60 bg-background hover:border-foreground/30"
                  )}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-background text-foreground font-bold text-[10px] tracking-wide uppercase rounded-md px-3 py-1 shadow-xs">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Name */}
                    <p
                      className={cn(
                        "text-sm font-bold uppercase tracking-[0.15em]",
                        plan.recommended
                          ? "text-background/60"
                          : "text-muted-foreground"
                      )}
                    >
                      {plan.name}
                    </p>

                    {/* Price */}
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-black tracking-tight">
                        {formatPrice(perMonth)}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          plan.recommended
                            ? "text-background/50"
                            : "text-muted-foreground"
                        )}
                      >
                        /mo
                      </span>
                    </div>

                    {isYearly && (
                      <p
                        className={cn(
                          "mt-1 text-xs font-medium",
                          plan.recommended
                            ? "text-background/50"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatPrice(price)} billed annually
                      </p>
                    )}

                    {/* Description */}
                    <p
                      className={cn(
                        "mt-4 text-sm font-normal leading-relaxed",
                        plan.recommended
                          ? "text-background/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {plan.description}
                    </p>

                    {/* CTA */}
                    <div className="mt-6">
                      <Button
                        asChild
                        className={cn(
                          "w-full h-11 font-medium transition-all duration-200",
                          plan.recommended
                            ? "bg-background text-foreground hover:bg-background/90"
                            : "bg-foreground text-background hover:bg-foreground/85"
                        )}
                      >
                        <Link href="/register/client">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    {/* Divider */}
                    <div
                      className={cn(
                        "mt-8 border-t",
                        plan.recommended
                          ? "border-background/15"
                          : "border-border/60"
                      )}
                    />

                    {/* Features */}
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check
                            className={cn(
                              "h-4 w-4 mt-0.5 shrink-0",
                              plan.recommended
                                ? "text-background/60"
                                : "text-foreground/50"
                            )}
                            strokeWidth={2.5}
                          />
                          <span
                            className={cn(
                              "text-sm font-normal",
                              plan.recommended
                                ? "text-background/80"
                                : "text-foreground/80"
                            )}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Promo Callout */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-xl border border-border/60 bg-secondary/50 p-8 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-foreground/5 mb-4">
                <Sparkles className="h-5 w-5 text-foreground/60" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Founding Client Program
              </h3>
              <p className="mt-2 text-sm text-muted-foreground font-normal max-w-md mx-auto leading-relaxed">
                Founding clients get full access free. Reach out for your promo
                code and enter it at checkout for complimentary access.
              </p>
              <Button
                variant="outline"
                asChild
                className="mt-5 h-10 px-6 font-medium border-foreground/20 hover:bg-foreground/5 transition-all duration-200"
              >
                <Link href="mailto:hello@codeks.io">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
