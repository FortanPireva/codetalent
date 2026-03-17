import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Headphones, Mail, MessageCircle, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with Talentflow. Contact our team, browse FAQs, or report an issue.",
};

function SupportCard({
  icon: Icon,
  title,
  description,
  action,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex flex-col rounded-xl border border-border/60 p-6 transition-all duration-200 hover:border-foreground/20 hover:bg-foreground/[0.02]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-foreground/[0.03] transition-colors duration-200 group-hover:bg-foreground group-hover:text-background">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-bold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-[15px] leading-[1.75] text-muted-foreground">
        {description}
      </p>
      <span className="mt-4 text-sm font-medium text-foreground/70 transition-colors duration-200 group-hover:text-foreground">
        {action} &rarr;
      </span>
    </a>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="border-b border-border/60 py-5 last:border-0">
      <h3 className="text-sm font-bold tracking-tight">{question}</h3>
      <p className="mt-2 text-[15px] leading-[1.75] text-muted-foreground">
        {answer}
      </p>
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
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

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-foreground text-background">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Support
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;re here to help. Reach out through any of the channels below.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60" />

        {/* Contact Cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <SupportCard
            icon={Mail}
            title="Email Us"
            description="Send us a message and we'll get back to you within 24 hours."
            action="support@codeks.hr"
            href="mailto:support@codeks.hr"
          />
          <SupportCard
            icon={MessageCircle}
            title="In-App Messages"
            description="Reach us directly through the messaging feature in your dashboard."
            action="Open dashboard"
            href="/dashboard"
          />
        </div>

        <div className="mt-12 border-t border-border/60" />

        {/* FAQ */}
        <div className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">
            Frequently Asked Questions
          </h2>

          <div className="mt-6">
            <FAQItem
              question="How do I create an account?"
              answer="Download the Talentflow app or visit our website and click &quot;Sign Up.&quot; Choose your role (developer or company), fill in your details, and complete the onboarding process."
            />
            <FAQItem
              question="How long does profile review take?"
              answer="Our team reviews new profiles within 1-2 business days. You'll receive a notification once your profile has been approved."
            />
            <FAQItem
              question="How does the AI code review work?"
              answer="When you submit a coding assessment, our AI analyzes your code across 8 categories including code quality, architecture, and best practices. Each category is scored from 1 to 5, and your results are used to match you with relevant opportunities."
            />
            <FAQItem
              question="Can I update my profile after submitting?"
              answer="Yes, you can update your skills, availability, rates, and other profile information at any time from your dashboard."
            />
            <FAQItem
              question="How do I delete my account?"
              answer="Contact us at support@codeks.hr and we'll process your account deletion request, including all associated data, within 5 business days."
            />
            <FAQItem
              question="I'm having trouble logging in."
              answer="Try resetting your password from the login screen. If the issue persists, email support@codeks.hr with the email address associated with your account."
            />
          </div>
        </div>

        <div className="mt-12 border-t border-border/60" />

        {/* Policies */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-6">
          <Link
            href="/privacy-policy"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
            Terms of Service
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Talentflow. All rights reserved.
          </p>
          <Link
            href="mailto:support@codeks.hr"
            className="text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            support@codeks.hr
          </Link>
        </div>
      </footer>
    </div>
  );
}
