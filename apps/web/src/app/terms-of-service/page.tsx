import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Code, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Talentflow",
  description:
    "Terms and conditions governing the use of the Talentflow platform.",
};

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: February 9, 2026
        </p>

        <Separator className="my-8" />

        <div className="prose prose-gray max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">
              1. Acceptance of Terms
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              By accessing or using the Talentflow platform
              (&quot;Platform&quot;), you agree to be bound by these Terms of
              Service (&quot;Terms&quot;). If you do not agree, you may not use
              the Platform. These Terms apply to all users, including candidates,
              hiring companies (&quot;Clients&quot;), and administrators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              2. Description of Service
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Talentflow is a B2B developer marketplace that connects companies
              with software engineers through AI-powered technical assessments.
              The Platform provides:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                Job listing and discovery for remote engineering positions.
              </li>
              <li>
                GitHub-based technical assessments with AI-powered code review.
              </li>
              <li>
                A talent pool of pre-vetted developers searchable by companies.
              </li>
              <li>
                Structured scoring and evaluation across 8 technical dimensions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <h3 className="mt-4 text-base font-medium">3.1 Registration</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              You must create an account to use the Platform. You agree to
              provide accurate, complete, and current information during
              registration and to keep your account information up to date.
            </p>
            <h3 className="mt-4 text-base font-medium">
              3.2 Account Security
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. Notify us immediately if you suspect unauthorized access.
            </p>
            <h3 className="mt-4 text-base font-medium">3.3 Account Types</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">Candidate:</strong>{" "}
                developers seeking remote positions who complete technical
                assessments.
              </li>
              <li>
                <strong className="text-foreground">Client:</strong> companies
                posting jobs and accessing the talent pool. Client accounts are
                subject to approval.
              </li>
              <li>
                <strong className="text-foreground">Admin:</strong> platform
                administrators with elevated privileges.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              4. Candidate Obligations
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                All code submissions must be your own original work. Plagiarism,
                AI-generated submissions (unless explicitly permitted by the
                assessment), or copying from others will result in account
                termination.
              </li>
              <li>
                You must not attempt to circumvent, manipulate, or game the
                AI-powered review system.
              </li>
              <li>
                Profile information including skills, experience, and
                availability must be accurate and current.
              </li>
              <li>
                By completing an assessment and entering the talent pool, you
                consent to your profile, scores, and review summaries being
                visible to hiring companies on the Platform.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Client Obligations</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                Job listings must contain accurate information including role
                description, salary range, tech stack, and work arrangement.
              </li>
              <li>
                Clients must not use candidate information obtained through the
                Platform for purposes other than hiring for the listed
                positions.
              </li>
              <li>
                Clients must not share candidate profiles, assessment results,
                or AI reviews with third parties outside their hiring team.
              </li>
              <li>
                Communication with candidates must be professional and
                conducted in good faith.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              6. AI-Powered Assessments
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Code submissions are evaluated by the Anthropic Claude AI model.
              You acknowledge and agree that:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                AI evaluations are automated and may not perfectly reflect your
                abilities. They serve as a structured screening tool, not a
                definitive judgment.
              </li>
              <li>
                Scores are based on the specific code submitted and evaluated
                against defined rubrics. Different submissions may receive
                different scores.
              </li>
              <li>
                Pass/fail thresholds vary by difficulty level (Intern &ge; 3.0,
                Junior &ge; 3.5, Mid-Level &ge; 4.0 average).
              </li>
              <li>
                We may update our AI models and evaluation criteria from time to
                time, which could affect scoring.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              7. Intellectual Property
            </h2>
            <h3 className="mt-4 text-base font-medium">7.1 Your Content</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              You retain ownership of the code you submit for assessments. By
              submitting code, you grant Talentflow a limited license to process,
              evaluate, store, and display your submission results to authorized
              users on the Platform (you, hiring companies, and administrators).
            </p>
            <h3 className="mt-4 text-base font-medium">
              7.2 Platform Content
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              The Platform, including its design, features, AI evaluation
              system, and content (excluding user-submitted content), is owned
              by Talentflow and protected by intellectual property laws. You may
              not copy, modify, distribute, or reverse-engineer any part of the
              Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Prohibited Conduct</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              You agree not to:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                Use the Platform for any unlawful purpose or in violation of
                these Terms.
              </li>
              <li>
                Attempt to gain unauthorized access to accounts, systems, or
                data.
              </li>
              <li>
                Scrape, crawl, or automatically extract data from the Platform.
              </li>
              <li>
                Misrepresent your identity, qualifications, or company
                information.
              </li>
              <li>
                Harass, abuse, or discriminate against other users.
              </li>
              <li>
                Interfere with or disrupt the Platform&apos;s operation or
                infrastructure.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Termination</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              We reserve the right to suspend or terminate your account at any
              time, with or without cause, including for violation of these
              Terms. You may close your account at any time by contacting us.
              Upon termination, your right to use the Platform ceases
              immediately. Provisions that by their nature should survive
              termination will remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              10. Disclaimers and Limitation of Liability
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              The Platform is provided &quot;as is&quot; and &quot;as
              available.&quot; We make no warranties, express or implied,
              regarding the Platform&apos;s reliability, accuracy, or fitness
              for a particular purpose.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              We do not guarantee that AI assessments will be error-free or
              that the Platform will result in successful hiring outcomes. To
              the maximum extent permitted by law, Talentflow shall not be liable
              for any indirect, incidental, special, or consequential damages
              arising from your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              11. Relationship Between Parties
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Talentflow is a marketplace platform. We are not an employer,
              staffing agency, or recruiter. Any employment relationship formed
              through the Platform is solely between the candidate and the
              hiring company. We are not a party to any employment agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              12. Changes to These Terms
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              We may revise these Terms at any time. Material changes will be
              communicated by posting the updated Terms with a revised date.
              Continued use of the Platform after changes take effect
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">13. Governing Law</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              These Terms shall be governed by and construed in accordance with
              applicable law. Any disputes arising under these Terms shall be
              resolved through good-faith negotiation, and if necessary, through
              binding arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">14. Contact Us</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              If you have questions about these Terms, please contact us at{" "}
              <strong className="text-foreground">legal@codeks.hr</strong>.
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
