import { Users, Building2, Zap } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Vetted Developers",
  },
  {
    icon: Building2,
    value: "50+",
    label: "Companies Hiring",
  },
  {
    icon: Zap,
    value: "Minutes",
    label: "AI Review Turnaround",
  },
];

export function SocialProofBar() {
  return (
    <section className="border-y bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-center gap-3 py-8"
            >
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
