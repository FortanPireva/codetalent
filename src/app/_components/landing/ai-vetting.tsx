import { Badge } from "@/components/ui/badge";
import {
  Code,
  Layers,
  Shield,
  AlertTriangle,
  TestTube,
  GitBranch,
  FileText,
  Lightbulb,
} from "lucide-react";

const categories = [
  { icon: Code, label: "Code Quality" },
  { icon: Layers, label: "Architecture" },
  { icon: Shield, label: "Type Safety" },
  { icon: AlertTriangle, label: "Error Handling" },
  { icon: TestTube, label: "Testing" },
  { icon: GitBranch, label: "Git Practices" },
  { icon: FileText, label: "Documentation" },
  { icon: Lightbulb, label: "Best Practices" },
];

const thresholds = [
  { level: "Intern", score: "≥ 3.0" },
  { level: "Junior", score: "≥ 3.5" },
  { level: "Mid-Level", score: "≥ 4.0" },
];

export function AiVetting() {
  return (
    <section className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              AI-Powered Vetting
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Every developer is evaluated on real code.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Candidates complete GitHub-based coding challenges. Claude AI
              reviews their code across 8 dimensions, producing a structured
              score from 1–5 in each category. Only candidates who meet the
              threshold for their target level enter the talent pool.
            </p>

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium">Pass thresholds:</p>
              <div className="flex gap-4">
                {thresholds.map((t) => (
                  <div key={t.level} className="text-center">
                    <Badge variant="secondary" className="mb-1">
                      {t.level}
                    </Badge>
                    <p className="text-sm font-medium">{t.score}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="flex flex-col items-center gap-2 rounded-xl border bg-background p-4 text-center"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5">
                  <cat.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium">{cat.label}</p>
                <p className="text-xs text-muted-foreground">Score 1–5</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
