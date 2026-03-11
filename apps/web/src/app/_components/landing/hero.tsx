import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="px-4 pt-20 pb-24 lg:pt-28 lg:pb-32">
      <div className="mx-auto max-w-4xl text-center">
        <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-sm">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Developer Marketplace
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Find exceptional remote{" "}
          <span className="underline decoration-primary/30 decoration-4 underline-offset-4">
            AI &amp; full-stack
          </span>{" "}
          engineers
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          The B2B developer marketplace where companies find pre-vetted engineers
          through AI-powered code assessments, and developers land quality remote
          roles.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register/client">
              Post a Job
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register">Find Remote Jobs</Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          No upfront fees. AI reviews in minutes, not days.
        </p>
      </div>
    </section>
  );
}
