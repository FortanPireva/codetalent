import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Bot,
  Users,
  CheckCircle,
  ArrowRight,
  Code,
  BarChart,
} from "lucide-react";
import { auth } from "@/server/auth";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }

    if (session.user.role === "CLIENT") {
      switch (session.user.clientStatus) {
        case "APPROVED":
          redirect("/client/dashboard");
        case "PENDING_REVIEW":
          redirect("/client/pending");
        case "REJECTED":
          redirect("/client/rejected");
        default:
          redirect("/client/onboarding");
      }
    }

    // Candidate routing based on onboarding status
    switch (session.user.candidateStatus) {
      case "APPROVED":
        redirect("/dashboard");
      case "PENDING_REVIEW":
        redirect("/pending");
      case "REJECTED":
        redirect("/rejected");
      default:
        redirect("/onboarding");
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Code className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Codeks HR</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            AI-Powered Technical Hiring
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Hire developers based on
            <br />
            <span className="text-primary">actual code</span>, not resumes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Codeks HR pairs GitHub-based technical assessments with AI-powered
            code review to help you find the best developers efficiently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Hiring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A streamlined process from assessment to hire
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Create Assessment",
                description:
                  "Set up coding challenges linked to GitHub starter repos",
                icon: GitBranch,
              },
              {
                step: "02",
                title: "Candidates Code",
                description:
                  "Developers fork repos and submit their solutions",
                icon: Code,
              },
              {
                step: "03",
                title: "AI Reviews",
                description:
                  "Claude AI analyzes code quality across 8 dimensions",
                icon: Bot,
              },
              {
                step: "04",
                title: "Build Talent Pool",
                description:
                  "Qualified candidates flow into your searchable pool",
                icon: Users,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">
                  Step {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Hire Better
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features to streamline your technical hiring
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <GitBranch className="h-10 w-10 text-primary mb-2" />
                <CardTitle>GitHub-Based Assessments</CardTitle>
                <CardDescription>
                  Real-world coding challenges using actual repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Customizable starter repos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Multiple difficulty levels
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Configurable time limits
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI-Powered Reviews</CardTitle>
                <CardDescription>
                  Consistent, unbiased code evaluation at scale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    8-category scoring rubric
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Detailed strengths & improvements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Auto pass/fail determination
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Talent Pool Management</CardTitle>
                <CardDescription>
                  Build and search your qualified candidate database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Filter by skills & availability
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Track candidate progress
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Export qualified candidates
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scoring Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Comprehensive Code Evaluation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI evaluates code across 8 critical dimensions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Code Quality",
              "Architecture",
              "Type Safety",
              "Error Handling",
              "Testing",
              "Git Practices",
              "Documentation",
              "Best Practices",
            ].map((category) => (
              <div
                key={category}
                className="bg-gray-50 rounded-lg p-4 text-center"
              >
                <p className="font-medium">{category}</p>
                <p className="text-sm text-muted-foreground">Score 1-5</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Pass thresholds by difficulty level:
            </p>
            <div className="flex justify-center gap-8">
              <div>
                <Badge variant="secondary" className="mb-1">
                  Intern
                </Badge>
                <p className="text-sm">≥ 3.0 avg</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">
                  Junior
                </Badge>
                <p className="text-sm">≥ 3.5 avg</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">
                  Mid-Level
                </Badge>
                <p className="text-sm">≥ 4.0 avg</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Hiring?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Join companies using Codeks HR to find the best developers
                through real coding assessments.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              <span className="font-bold">Codeks HR</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Hiring automation platform with AI-powered code review
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
