import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">Codeks HR</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <a
              href="#for-companies"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              For Companies
            </a>
            <a
              href="#for-developers"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              For Developers
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/register/client">Post a Job</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/register">Find Jobs</Link>
            </Button>
            <Button size="sm" asChild className="sm:hidden">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
