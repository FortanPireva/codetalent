export const experienceLevelLabels: Record<string, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Mid-Level",
  SENIOR: "Senior",
  STAFF: "Staff",
  PRINCIPAL: "Principal",
  LEAD: "Lead",
  MANAGER: "Manager",
};

export const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
};

export const workArrangementLabels: Record<string, string> = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE_LOCAL: "Remote (Local)",
  REMOTE_GLOBAL: "Remote (Global)",
};

export const applicationStatusLabels: Record<string, string> = {
  APPLIED: "Applied",
  INVITED: "Invited",
  INTERVIEW: "Interview",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export const applicationStatusDescriptions: Record<string, string> = {
  APPLIED: "Your application is being reviewed",
  INVITED: "You've been invited to the next step",
  INTERVIEW: "Interview stage in progress",
  HIRED: "Congratulations! You got the job",
  REJECTED: "This application was not selected",
};

export function formatSalary(
  min?: number | null,
  max?: number | null,
  currency = "USD",
  period = "YEARLY",
): string {
  if (!min && !max) return "";
  const fmt = (n: number) => {
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return n.toLocaleString();
  };
  const periodLabel = period === "YEARLY" ? "/yr" : period === "MONTHLY" ? "/mo" : `/${period.toLowerCase()}`;
  if (min && max) return `${currency} ${fmt(min)} – ${fmt(max)}${periodLabel}`;
  if (min) return `${currency} ${fmt(min)}+${periodLabel}`;
  return `Up to ${currency} ${fmt(max!)}${periodLabel}`;
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}
