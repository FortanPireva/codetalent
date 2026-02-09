import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 lg:py-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform how you hire?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">
            Join the marketplace where real code speaks louder than resumes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register/client">
                Post a Job
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/register">Join as a Developer</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
