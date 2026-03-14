import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground dark:bg-card dark:text-foreground sm:px-12 lg:py-20">
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
              className="border-white/30 text-white hover:bg-white/10 hover:text-white dark:border-border dark:text-foreground dark:hover:bg-accent/30"
            >
              <Link href="/register">Join as a Developer</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            Available on mobile for developers
          </div>
          <h3 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Take your career on the go
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Track your applications, get notified about new opportunities, and
            manage your profile — all from your phone.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                width={150}
                height={50}
                className="h-[50px] w-auto"
              />
            </Link>
            <Link
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                width={168}
                height={50}
                className="h-[50px] w-auto"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
