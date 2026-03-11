import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  FileText,
  Users,
  Bot,
  Send,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Post jobs with full transparency",
    description:
      "Salary ranges, tech stack, work arrangement — candidates see everything upfront.",
  },
  {
    icon: Users,
    title: "Access a pre-vetted talent pool",
    description:
      "Filter by skills, AI scores, and availability to find the right engineers fast.",
  },
  {
    icon: Bot,
    title: "AI handles technical screening",
    description:
      "8-dimension code evaluation completed in minutes, not days of manual review.",
  },
  {
    icon: Send,
    title: "Invite candidates to interview",
    description:
      "Direct outreach from the talent pool — skip recruiters and connect directly.",
  },
];

export function ForCompanies() {
  return (
    <section id="for-companies" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            For Companies
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Stop sifting through resumes.
            <br />
            Start reviewing real code.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-none bg-muted/40">
              <CardContent className="flex gap-4 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <Button asChild>
            <Link href="/register/client">
              Start Hiring
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
