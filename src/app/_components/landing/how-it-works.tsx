import {
  FileText,
  Users,
  BarChart,
  Send,
  UserPlus,
  Code,
  Bot,
  Eye,
} from "lucide-react";

const companySteps = [
  { icon: FileText, label: "Post a job" },
  { icon: Users, label: "Browse the talent pool" },
  { icon: BarChart, label: "Review AI assessments" },
  { icon: Send, label: "Invite to interview" },
];

const developerSteps = [
  { icon: UserPlus, label: "Create your profile" },
  { icon: Code, label: "Complete an assessment" },
  { icon: Bot, label: "Get AI-reviewed" },
  { icon: Eye, label: "Get discovered" },
];

function StepList({
  steps,
}: {
  steps: { icon: React.ComponentType<{ className?: string }>; label: string }[];
}) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/20 bg-background">
              <step.icon className="h-4 w-4 text-primary" />
            </div>
            {index < steps.length - 1 && (
              <div className="h-8 w-px bg-border" />
            )}
          </div>
          <div className="flex h-10 items-center">
            <p className="font-medium">
              <span className="mr-2 text-muted-foreground">{index + 1}.</span>
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-2 text-muted-foreground">
            Two parallel paths, one marketplace.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-16 md:grid-cols-2 md:gap-12">
          <div>
            <h3 className="mb-8 text-lg font-semibold">Company Path</h3>
            <StepList steps={companySteps} />
          </div>
          <div>
            <h3 className="mb-8 text-lg font-semibold">Developer Path</h3>
            <StepList steps={developerSteps} />
          </div>
        </div>
      </div>
    </section>
  );
}
