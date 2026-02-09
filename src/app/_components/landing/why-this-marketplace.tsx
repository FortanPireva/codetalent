import {
  Sparkles,
  Globe,
  Code,
  Bot,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

const differentiators = [
  {
    icon: Sparkles,
    title: "Built for the AI age",
    description:
      "AI evaluates actual code contributions, not keyword-matched resumes.",
  },
  {
    icon: Globe,
    title: "Remote-first by default",
    description:
      "Filter by timezone, work arrangement, and visa status from the start.",
  },
  {
    icon: Code,
    title: "Real code, not whiteboards",
    description:
      "Production-style challenges in real GitHub repos — the way developers actually work.",
  },
  {
    icon: Bot,
    title: "AI-enhanced, not AI-replaced",
    description:
      "AI handles screening at scale. Humans make the hiring decisions.",
  },
  {
    icon: DollarSign,
    title: "Transparent compensation",
    description:
      "Salary ranges, equity, and benefits are visible upfront on every listing.",
  },
  {
    icon: ShieldCheck,
    title: "Pre-vetted talent",
    description:
      "Every developer in the talent pool has passed an AI code review.",
  },
];

export function WhyThisMarketplace() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Codeks HR
          </h2>
          <p className="mt-2 text-muted-foreground">
            A marketplace built differently.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
