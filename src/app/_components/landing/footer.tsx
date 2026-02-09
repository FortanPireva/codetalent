import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Code } from "lucide-react";

const companyLinks = [
  { label: "Post a Job", href: "/register/client" },
  { label: "Talent Pool", href: "/login" },
  { label: "AI Code Review", href: "#ai-vetting" },
  { label: "Pricing", href: "#for-companies" },
];

const developerLinks = [
  { label: "Find Jobs", href: "/register" },
  { label: "Take Assessment", href: "/register" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Join Talent Pool", href: "/register" },
];

const platformLinks = [
  { label: "Sign In", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "For Companies", href: "#for-companies" },
  { label: "For Developers", href: "#for-developers" },
];

export function Footer() {
  return (
    <footer className="border-t py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Codeks HR</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              The B2B developer marketplace connecting companies with pre-vetted
              engineers through AI-powered code assessments.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">For Companies</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">For Developers</h4>
            <ul className="space-y-2">
              {developerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Platform</h4>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Codeks HR. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by AI-driven code review
          </p>
        </div>
      </div>
    </footer>
  );
}
