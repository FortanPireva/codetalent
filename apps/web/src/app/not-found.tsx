"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      {/* Animated grid background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: mounted ? 0.04 : 0,
            backgroundImage: `
              linear-gradient(to right, var(--foreground) 1px, transparent 1px),
              linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
        {/* Radial fade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 20%, var(--background) 70%)",
          }}
        />
      </div>

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        {/* Large 404 display */}
        <div
          className="relative mb-8 select-none"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span className="text-[10rem] font-black leading-none tracking-tighter text-foreground/[0.06] sm:text-[14rem]">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-6xl font-black tracking-tighter text-foreground sm:text-7xl">
            404
          </span>
        </div>

        {/* Message */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
          }}
        >
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="mb-10 text-base leading-relaxed text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div
          className="flex flex-col gap-3 sm:flex-row"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
          }}
        >
          <Button
            asChild
            size="lg"
            className="h-11 gap-2 px-6 font-medium tracking-wide transition-all duration-200"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 gap-2 border-foreground/20 px-6 font-medium tracking-wide transition-all duration-200 hover:bg-foreground/5"
            onClick={() => history.back()}
          >
            <button type="button" onClick={() => history.back()}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </Button>
        </div>

        {/* Branding */}
        <p
          className="mt-16 text-xs font-medium tracking-widest text-muted-foreground/50 uppercase"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 1s ease 0.6s",
          }}
        >
          Talentflow
        </p>
      </div>
    </div>
  );
}
