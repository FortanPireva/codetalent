import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Talentflow collects, uses, and protects your personal information.",
};

function SectionHeading({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <h2 className="text-lg font-bold tracking-tight">
      <span className="text-muted-foreground font-medium">{number}.</span>{" "}
      {title}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-5 text-base font-medium tracking-tight">{children}</h3>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-[15px] leading-[1.75] text-muted-foreground">
      {children}
    </p>
  );
}

function BulletList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-3 space-y-2 pl-5 text-[15px] leading-[1.75] text-muted-foreground">
      {children}
    </ul>
  );
}

function BulletItem({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative pl-3 before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-foreground/30">
      {label && (
        <strong className="text-foreground font-medium">{label}</strong>
      )}{" "}
      {children}
    </li>
  );
}

export default function PrivacyPolicyPage() {
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
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: March 14, 2026
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60" />

        {/* Sections */}
        <div className="mt-10 space-y-10">
          <section>
            <SectionHeading number="1" title="Introduction" />
            <Paragraph>
              Talentflow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
              operates a B2B developer marketplace that connects companies with
              pre-vetted software engineers through AI-powered code assessments.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our platform.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="2" title="Information We Collect" />

            <SubHeading>2.1 Information You Provide</SubHeading>
            <BulletList>
              <BulletItem label="Account information:">
                name, email address, password, and role (candidate, company, or
                admin).
              </BulletItem>
              <BulletItem label="Profile information:">
                skills, experience level, resume, availability status, timezone,
                and work arrangement preferences.
              </BulletItem>
              <BulletItem label="Company information:">
                company name, website, description, and job listings including
                salary ranges, tech stack, and benefits.
              </BulletItem>
              <BulletItem label="Code submissions:">
                GitHub repository URLs and source code submitted as part of
                technical assessments.
              </BulletItem>
            </BulletList>

            <SubHeading>2.2 Information Collected Automatically</SubHeading>
            <BulletList>
              <BulletItem label="Usage data:">
                pages visited, features used, session duration, and interaction
                patterns.
              </BulletItem>
              <BulletItem label="Device information:">
                browser type, operating system, IP address, and device
                identifiers.
              </BulletItem>
              <BulletItem label="Cookies:">
                session cookies for authentication (JWT tokens) and preferences.
              </BulletItem>
            </BulletList>

            <SubHeading>2.3 Information from Third Parties</SubHeading>
            <BulletList>
              <BulletItem label="GitHub:">
                public repository data, file contents, and repository metadata
                accessed via the GitHub API for assessment purposes.
              </BulletItem>
            </BulletList>
          </section>

          <section>
            <SectionHeading
              number="3"
              title="How We Use Your Information"
            />
            <BulletList>
              <BulletItem>
                Provide, operate, and maintain the marketplace platform.
              </BulletItem>
              <BulletItem>
                Process and evaluate code submissions using AI-powered review
                (Anthropic Claude API).
              </BulletItem>
              <BulletItem>
                Generate structured scoring across 8 assessment categories for
                talent pool placement.
              </BulletItem>
              <BulletItem>
                Match candidates with companies based on skills, scores, and
                availability.
              </BulletItem>
              <BulletItem>
                Facilitate communication between hiring companies and
                candidates.
              </BulletItem>
              <BulletItem>
                Send account-related notifications (submission status, review
                results, interview invitations).
              </BulletItem>
              <BulletItem>
                Improve our AI evaluation models and platform features.
              </BulletItem>
              <BulletItem>
                Ensure platform security and prevent fraudulent activity.
              </BulletItem>
            </BulletList>
          </section>

          <section>
            <SectionHeading number="4" title="AI-Powered Code Review" />
            <Paragraph>
              Your code submissions are processed by the Anthropic Claude AI
              model to generate objective technical evaluations. Code is analyzed
              across eight dimensions: Code Quality, Architecture, Type Safety,
              Error Handling, Testing, Git Practices, Documentation, and Best
              Practices. Each category receives a score from 1 to 5.
            </Paragraph>
            <Paragraph>
              Code submitted for review is sent to Anthropic&apos;s API for
              processing. We do not use your code to train AI models. Review
              results are stored on our platform and visible to you and to
              companies who access the talent pool.
            </Paragraph>
          </section>

          <section>
            <SectionHeading
              number="5"
              title="How We Share Your Information"
            />
            <BulletList>
              <BulletItem label="With companies:">
                when you are in the talent pool, hiring companies can view your
                profile, skills, assessment scores, and review summaries.
              </BulletItem>
              <BulletItem label="Service providers:">
                we use third-party services including Supabase (database
                hosting), Anthropic (AI code review), and GitHub (repository
                access) to operate the platform.
              </BulletItem>
              <BulletItem label="Legal requirements:">
                we may disclose information if required by law, regulation, or
                legal process.
              </BulletItem>
            </BulletList>
            <Paragraph>
              We do not sell your personal information to third parties.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="6" title="Data Security" />
            <Paragraph>
              We implement industry-standard security measures including
              encrypted connections (HTTPS/TLS), JWT-based authentication with
              secure session management, hashed passwords, and access controls
              based on user roles (admin, candidate, client). While no system is
              100% secure, we take reasonable steps to protect your data.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="7" title="Data Retention" />
            <Paragraph>
              We retain your account data and assessment results for as long as
              your account is active. Code submissions and AI review results are
              retained to maintain your talent pool profile. You may request
              deletion of your account and associated data at any time by
              contacting us.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="8" title="Your Rights" />
            <Paragraph>
              Depending on your jurisdiction, you may have the right to:
            </Paragraph>
            <BulletList>
              <BulletItem>
                Access the personal information we hold about you.
              </BulletItem>
              <BulletItem>
                Request correction of inaccurate information.
              </BulletItem>
              <BulletItem>
                Request deletion of your personal data.
              </BulletItem>
              <BulletItem>
                Object to or restrict certain processing activities.
              </BulletItem>
              <BulletItem>
                Request portability of your data in a machine-readable format.
              </BulletItem>
              <BulletItem>
                Withdraw consent where processing is based on consent.
              </BulletItem>
            </BulletList>
          </section>

          <section>
            <SectionHeading number="9" title="Cookies and Tracking" />
            <Paragraph>
              We use essential cookies for authentication and session management.
              These are necessary for the platform to function and cannot be
              disabled. We do not use third-party advertising or tracking
              cookies.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="10" title="Changes to This Policy" />
            <Paragraph>
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the updated policy on
              this page with a revised &quot;Last updated&quot; date. Your
              continued use of the platform after changes constitutes acceptance
              of the updated policy.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="11" title="Contact Us" />
            <Paragraph>
              If you have questions about this Privacy Policy or our data
              practices, please contact us at{" "}
              <strong className="text-foreground font-medium">
                privacy@codeks.hr
              </strong>
              .
            </Paragraph>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Talentflow. All rights reserved.
          </p>
          <Link
            href="/terms-of-service"
            className="text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
