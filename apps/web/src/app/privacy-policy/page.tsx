import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Code, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Talentflow",
  description:
    "Learn how Talentflow collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Code className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold tracking-tight">
                Talentflow
              </span>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: February 9, 2026
        </p>

        <Separator className="my-8" />

        <div className="prose prose-gray max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Talentflow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
              operates a B2B developer marketplace that connects companies with
              pre-vetted software engineers through AI-powered code assessments.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              2. Information We Collect
            </h2>
            <h3 className="mt-4 text-base font-medium">
              2.1 Information You Provide
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">Account information:</strong>{" "}
                name, email address, password, and role (candidate, company, or
                admin).
              </li>
              <li>
                <strong className="text-foreground">Profile information:</strong>{" "}
                skills, experience level, resume, availability status, timezone,
                and work arrangement preferences.
              </li>
              <li>
                <strong className="text-foreground">
                  Company information:
                </strong>{" "}
                company name, website, description, and job listings including
                salary ranges, tech stack, and benefits.
              </li>
              <li>
                <strong className="text-foreground">Code submissions:</strong>{" "}
                GitHub repository URLs and source code submitted as part of
                technical assessments.
              </li>
            </ul>

            <h3 className="mt-4 text-base font-medium">
              2.2 Information Collected Automatically
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">Usage data:</strong> pages
                visited, features used, session duration, and interaction
                patterns.
              </li>
              <li>
                <strong className="text-foreground">Device information:</strong>{" "}
                browser type, operating system, IP address, and device
                identifiers.
              </li>
              <li>
                <strong className="text-foreground">Cookies:</strong> session
                cookies for authentication (JWT tokens) and preferences.
              </li>
            </ul>

            <h3 className="mt-4 text-base font-medium">
              2.3 Information from Third Parties
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">GitHub:</strong> public
                repository data, file contents, and repository metadata accessed
                via the GitHub API for assessment purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              3. How We Use Your Information
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                Provide, operate, and maintain the marketplace platform.
              </li>
              <li>
                Process and evaluate code submissions using AI-powered review
                (Anthropic Claude API).
              </li>
              <li>
                Generate structured scoring across 8 assessment categories for
                talent pool placement.
              </li>
              <li>
                Match candidates with companies based on skills, scores, and
                availability.
              </li>
              <li>
                Facilitate communication between hiring companies and
                candidates.
              </li>
              <li>
                Send account-related notifications (submission status, review
                results, interview invitations).
              </li>
              <li>
                Improve our AI evaluation models and platform features.
              </li>
              <li>
                Ensure platform security and prevent fraudulent activity.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              4. AI-Powered Code Review
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Your code submissions are processed by the Anthropic Claude AI
              model to generate objective technical evaluations. Code is analyzed
              across eight dimensions: Code Quality, Architecture, Type Safety,
              Error Handling, Testing, Git Practices, Documentation, and Best
              Practices. Each category receives a score from 1 to 5.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Code submitted for review is sent to Anthropic&apos;s API for
              processing. We do not use your code to train AI models. Review
              results are stored on our platform and visible to you and to
              companies who access the talent pool.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              5. How We Share Your Information
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">With companies:</strong>{" "}
                when you are in the talent pool, hiring companies can view your
                profile, skills, assessment scores, and review summaries.
              </li>
              <li>
                <strong className="text-foreground">Service providers:</strong>{" "}
                we use third-party services including Supabase (database
                hosting), Anthropic (AI code review), and GitHub (repository
                access) to operate the platform.
              </li>
              <li>
                <strong className="text-foreground">Legal requirements:</strong>{" "}
                we may disclose information if required by law, regulation, or
                legal process.
              </li>
            </ul>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Data Security</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              We implement industry-standard security measures including
              encrypted connections (HTTPS/TLS), JWT-based authentication with
              secure session management, hashed passwords, and access controls
              based on user roles (admin, candidate, client). While no system is
              100% secure, we take reasonable steps to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Data Retention</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              We retain your account data and assessment results for as long as
              your account is active. Code submissions and AI review results are
              retained to maintain your talent pool profile. You may request
              deletion of your account and associated data at any time by
              contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Your Rights</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your personal data.</li>
              <li>Object to or restrict certain processing activities.</li>
              <li>
                Request portability of your data in a machine-readable format.
              </li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              9. Cookies and Tracking
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              We use essential cookies for authentication and session management.
              These are necessary for the platform to function and cannot be
              disabled. We do not use third-party advertising or tracking
              cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              10. Changes to This Policy
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the updated policy on
              this page with a revised &quot;Last updated&quot; date. Your
              continued use of the platform after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contact Us</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              If you have questions about this Privacy Policy or our data
              practices, please contact us at{" "}
              <strong className="text-foreground">privacy@codeks.hr</strong>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} Talentflow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
