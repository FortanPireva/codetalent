import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Briefcase,
  GitBranch,
  Brain,
  Eye,
} from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Browse quality remote jobs",
    description:
      "Curated listings from vetted companies with transparent compensation.",
  },
  {
    icon: GitBranch,
    title: "Real GitHub assessments",
    description:
      "Fork, code, submit — real-world challenges, not LeetCode puzzles.",
  },
  {
    icon: Brain,
    title: "Objective AI code reviews",
    description:
      "Scored on 8 dimensions by Claude AI — no bias, no subjectivity.",
  },
  {
    icon: Eye,
    title: "Get discovered by companies",
    description:
      "Enter the talent pool and get invited to interview by hiring teams.",
  },
];

export function ForDevelopers() {
  return (
    <section id="for-developers" className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-right">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            For Developers
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Show your skills through real code,
            <br />
            not whiteboard puzzles.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-none bg-background/60">
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

        <div className="mt-10 text-right">
          <Button asChild>
            <Link href="/register">
              Join as a Developer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
