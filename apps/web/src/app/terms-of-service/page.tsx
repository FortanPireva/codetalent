import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions governing the use of the Talentflow platform.",
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

export default function TermsOfServicePage() {
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
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Terms of Service
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
            <SectionHeading number="1" title="Acceptance of Terms" />
            <Paragraph>
              By accessing or using the Talentflow platform
              (&quot;Platform&quot;), you agree to be bound by these Terms of
              Service (&quot;Terms&quot;). If you do not agree, you may not use
              the Platform. These Terms apply to all users, including candidates,
              hiring companies (&quot;Clients&quot;), and administrators.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="2" title="Description of Service" />
            <Paragraph>
              Talentflow is a B2B developer marketplace that connects companies
              with software engineers through AI-powered technical assessments.
              The Platform provides:
            </Paragraph>
            <BulletList>
              <BulletItem>
                Job listing and discovery for remote engineering positions.
              </BulletItem>
              <BulletItem>
                GitHub-based technical assessments with AI-powered code review.
              </BulletItem>
              <BulletItem>
                A talent pool of pre-vetted developers searchable by companies.
              </BulletItem>
              <BulletItem>
                Structured scoring and evaluation across 8 technical dimensions.
              </BulletItem>
            </BulletList>
          </section>

          <section>
            <SectionHeading number="3" title="User Accounts" />

            <SubHeading>3.1 Registration</SubHeading>
            <Paragraph>
              You must create an account to use the Platform. You agree to
              provide accurate, complete, and current information during
              registration and to keep your account information up to date.
            </Paragraph>

            <SubHeading>3.2 Account Security</SubHeading>
            <Paragraph>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. Notify us immediately if you suspect unauthorized access.
            </Paragraph>

            <SubHeading>3.3 Account Types</SubHeading>
            <BulletList>
              <BulletItem label="Candidate:">
                developers seeking remote positions who complete technical
                assessments.
              </BulletItem>
              <BulletItem label="Client:">
                companies posting jobs and accessing the talent pool. Client
                accounts are subject to approval.
              </BulletItem>
              <BulletItem label="Admin:">
                platform administrators with elevated privileges.
              </BulletItem>
            </BulletList>
          </section>

          <section>
            <SectionHeading number="4" title="Candidate Obligations" />
            <BulletList>
              <BulletItem>
                All code submissions must be your own original work. Plagiarism,
                AI-generated submissions (unless explicitly permitted by the
                assessment), or copying from others will result in account
                termination.
              </BulletItem>
              <BulletItem>
                You must not attempt to circumvent, manipulate, or game the
                AI-powered review system.
              </BulletItem>
              <BulletItem>
                Profile information including skills, experience, and
                availability must be accurate and current.
              </BulletItem>
              <BulletItem>
                By completing an assessment and entering the talent pool, you
                consent to your profile, scores, and review summaries being
                visible to hiring companies on the Platform.
              </BulletItem>
            </BulletList>
          </section>

          <section>
            <SectionHeading number="5" title="Client Obligations" />
            <BulletList>
              <BulletItem>
                Job listings must contain accurate information including role
                description, salary range, tech stack, and work arrangement.
              </BulletItem>
              <BulletItem>
                Clients must not use candidate information obtained through the
                Platform for purposes other than hiring for the listed
                positions.
              </BulletItem>
              <BulletItem>
                Clients must not share candidate profiles, assessment results,
                or AI reviews with third parties outside their hiring team.
              </BulletItem>
              <BulletItem>
                Communication with candidates must be professional and
                conducted in good faith.
              </BulletItem>
            </BulletList>
          </section>

          <section>
            <SectionHeading number="6" title="AI-Powered Assessments" />
            <Paragraph>
              Code submissions are evaluated by the Anthropic Claude AI model.
              You acknowledge and agree that:
            </Paragraph>
            <BulletList>
              <BulletItem>
                AI evaluations are automated and may not perfectly reflect your
                abilities. They serve as a structured screening tool, not a
                definitive judgment.
              </BulletItem>
              <BulletItem>
                Scores are based on the specific code submitted and evaluated
                against defined rubrics. Different submissions may receive
                different scores.
              </BulletItem>
              <BulletItem>
                Pass/fail thresholds vary by difficulty level (Intern &ge; 3.0,
                Junior &ge; 3.5, Mid-Level &ge; 4.0 average).
              </BulletItem>
              <BulletItem>
                We may update our AI models and evaluation criteria from time to
                time, which could affect scoring.
              </BulletItem>
            </BulletList>
          </section>

          <section>
            <SectionHeading number="7" title="Intellectual Property" />

            <SubHeading>7.1 Your Content</SubHeading>
            <Paragraph>
              You retain ownership of the code you submit for assessments. By
              submitting code, you grant Talentflow a limited license to process,
              evaluate, store, and display your submission results to authorized
              users on the Platform (you, hiring companies, and administrators).
            </Paragraph>

            <SubHeading>7.2 Platform Content</SubHeading>
            <Paragraph>
              The Platform, including its design, features, AI evaluation
              system, and content (excluding user-submitted content), is owned
              by Talentflow and protected by intellectual property laws. You may
              not copy, modify, distribute, or reverse-engineer any part of the
              Platform.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="8" title="Prohibited Conduct" />
            <Paragraph>You agree not to:</Paragraph>
            <BulletList>
              <BulletItem>
                Use the Platform for any unlawful purpose or in violation of
                these Terms.
              </BulletItem>
              <BulletItem>
                Attempt to gain unauthorized access to accounts, systems, or
                data.
              </BulletItem>
              <BulletItem>
                Scrape, crawl, or automatically extract data from the Platform.
              </BulletItem>
              <BulletItem>
                Misrepresent your identity, qualifications, or company
                information.
              </BulletItem>
              <BulletItem>
                Harass, abuse, or discriminate against other users.
              </BulletItem>
              <BulletItem>
                Interfere with or disrupt the Platform&apos;s operation or
                infrastructure.
              </BulletItem>
            </BulletList>
          </section>

          <section>
            <SectionHeading number="9" title="Termination" />
            <Paragraph>
              We reserve the right to suspend or terminate your account at any
              time, with or without cause, including for violation of these
              Terms. You may close your account at any time by contacting us.
              Upon termination, your right to use the Platform ceases
              immediately. Provisions that by their nature should survive
              termination will remain in effect.
            </Paragraph>
          </section>

          <section>
            <SectionHeading
              number="10"
              title="Disclaimers and Limitation of Liability"
            />
            <Paragraph>
              The Platform is provided &quot;as is&quot; and &quot;as
              available.&quot; We make no warranties, express or implied,
              regarding the Platform&apos;s reliability, accuracy, or fitness
              for a particular purpose.
            </Paragraph>
            <Paragraph>
              We do not guarantee that AI assessments will be error-free or
              that the Platform will result in successful hiring outcomes. To
              the maximum extent permitted by law, Talentflow shall not be liable
              for any indirect, incidental, special, or consequential damages
              arising from your use of the Platform.
            </Paragraph>
          </section>

          <section>
            <SectionHeading
              number="11"
              title="Relationship Between Parties"
            />
            <Paragraph>
              Talentflow is a marketplace platform. We are not an employer,
              staffing agency, or recruiter. Any employment relationship formed
              through the Platform is solely between the candidate and the
              hiring company. We are not a party to any employment agreement.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="12" title="Changes to These Terms" />
            <Paragraph>
              We may revise these Terms at any time. Material changes will be
              communicated by posting the updated Terms with a revised date.
              Continued use of the Platform after changes take effect
              constitutes acceptance of the revised Terms.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="13" title="Governing Law" />
            <Paragraph>
              These Terms shall be governed by and construed in accordance with
              applicable law. Any disputes arising under these Terms shall be
              resolved through good-faith negotiation, and if necessary, through
              binding arbitration.
            </Paragraph>
          </section>

          <section>
            <SectionHeading number="14" title="Contact Us" />
            <Paragraph>
              If you have questions about these Terms, please contact us at{" "}
              <strong className="text-foreground font-medium">
                legal@codeks.hr
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
