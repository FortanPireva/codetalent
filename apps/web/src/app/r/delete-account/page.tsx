"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

const deleteRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  reason: z.string().optional(),
  confirmation: z.literal(true, {
    errorMap: () => ({
      message: "You must confirm that you understand this action",
    }),
  }),
});

type DeleteRequestData = z.infer<typeof deleteRequestSchema>;

export default function DeleteAccountPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteRequestData>({
    resolver: zodResolver(deleteRequestSchema),
    defaultValues: {
      email: "",
      reason: "",
    },
  });

  const onSubmit = async (data: DeleteRequestData) => {
    setSubmitting(true);
    // Simulate submission delay — in production, this would call an API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // TODO: Wire to actual API endpoint (e.g., tRPC mutation or email service)
    console.log("Delete account request:", data);
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-sm font-bold tracking-tight transition-opacity duration-200 hover:opacity-70"
          >
            Talentflow
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-foreground/5 hover:text-foreground"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-xl px-6 py-16 lg:py-24">
        {submitted ? (
          /* Success State */
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border/60 bg-foreground text-background">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              Request Received
            </h1>
            <p className="mt-3 max-w-sm text-[15px] leading-[1.75] text-muted-foreground">
              We&apos;ve received your account deletion request. You&apos;ll
              receive a confirmation email within 24 hours. Your account and
              associated data will be permanently deleted within 30 days.
            </p>
            <Button
              className="mt-8 h-10 px-5 font-medium transition-all duration-200"
              asChild
            >
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        ) : (
          /* Form State */
          <>
            <div className="space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-foreground text-background">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Delete Your Account
                </h1>
                <p className="mt-2 text-[15px] leading-[1.75] text-muted-foreground">
                  Request permanent deletion of your Talentflow account and all
                  associated data.
                </p>
              </div>
            </div>

            <div className="mt-10 border-t border-border/60" />

            {/* Warning */}
            <div className="mt-8 flex gap-3 rounded-lg border border-border/60 bg-muted/50 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="text-[13px] leading-[1.7] text-muted-foreground">
                <p className="font-medium text-foreground">
                  This action is permanent
                </p>
                <p className="mt-1">
                  Once processed, all your data will be permanently deleted,
                  including your profile, assessment submissions, AI review
                  scores, job applications, and messages. This cannot be undone.
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-6"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="border-border bg-transparent font-normal focus-visible:border-foreground/40 focus-visible:ring-foreground/20"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter the email associated with your Talentflow account.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="reason"
                  className="text-sm font-medium"
                >
                  Reason for leaving{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="reason"
                  rows={3}
                  placeholder="Help us improve — tell us why you're leaving"
                  className="resize-none border-border bg-transparent font-normal focus-visible:border-foreground/40 focus-visible:ring-foreground/20"
                  {...register("reason")}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-border accent-foreground"
                    {...register("confirmation")}
                  />
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    I understand that deleting my account is permanent and all my
                    data — including profile, assessments, reviews, and
                    applications — will be permanently removed.
                  </span>
                </label>
                {errors.confirmation && (
                  <p className="text-sm text-destructive">
                    {errors.confirmation.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-10 w-full px-5 font-medium transition-all duration-200 sm:w-auto"
                >
                  {submitting ? "Submitting..." : "Request Account Deletion"}
                </Button>
              </div>
            </form>

            {/* Data we delete */}
            <div className="mt-12 border-t border-border/60 pt-8">
              <h2 className="text-sm font-bold tracking-tight">
                What gets deleted
              </h2>
              <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-muted-foreground">
                {[
                  "Your account and login credentials",
                  "Profile information (name, bio, skills, resume)",
                  "Assessment submissions and source code",
                  "AI review scores and feedback",
                  "Job applications and saved jobs",
                  "All messages and conversations",
                ].map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-foreground/30"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] text-muted-foreground">
                Deletion is processed within 30 days of confirmation. For
                questions, contact{" "}
                <strong className="font-medium text-foreground">
                  privacy@codeks.hr
                </strong>
                .
              </p>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-xl items-center justify-between px-6 py-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Talentflow. All rights reserved.
          </p>
          <Link
            href="/privacy-policy"
            className="text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
