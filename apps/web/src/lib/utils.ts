import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SubmissionStatus, Difficulty, Availability, CandidateStatus, CompanySize, ClientStatus, ClientOnboardingStatus, JobStatus, ExperienceLevel, EmploymentType, WorkArrangement, JobUrgency, ApplicationStatus } from "@codetalent/db";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const statusColors: Record<SubmissionStatus, string> = {
  ASSIGNED: "bg-chip text-chip-foreground",
  IN_PROGRESS: "bg-chip text-chip-foreground",
  SUBMITTED: "bg-chip text-chip-foreground",
  UNDER_REVIEW: "bg-chip text-chip-foreground",
  PASSED: "bg-highlight-muted text-highlight",
  REJECTED: "bg-chip text-chip-foreground",
};

export const statusLabels: Record<SubmissionStatus, string> = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  PASSED: "Passed",
  REJECTED: "Rejected",
};

export const difficultyColors: Record<Difficulty, string> = {
  INTERN: "bg-chip text-chip-foreground",
  JUNIOR: "bg-chip text-chip-foreground",
  MID: "bg-chip text-chip-foreground",
};

export const difficultyLabels: Record<Difficulty, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Mid-Level",
};

export const availabilityColors: Record<Availability, string> = {
  ACTIVELY_LOOKING: "bg-highlight-muted text-highlight",
  OPEN_TO_OFFERS: "bg-chip text-chip-foreground",
  NOT_LOOKING: "bg-chip text-chip-foreground",
  HIRED: "bg-highlight-muted text-highlight",
};

export const availabilityLabels: Record<Availability, string> = {
  ACTIVELY_LOOKING: "Actively Looking",
  OPEN_TO_OFFERS: "Open to Offers",
  NOT_LOOKING: "Not Looking",
  HIRED: "Hired",
};

export const candidateStatusColors: Record<CandidateStatus, string> = {
  ONBOARDING: "bg-chip text-chip-foreground",
  PENDING_REVIEW: "bg-chip text-chip-foreground",
  APPROVED: "bg-highlight-muted text-highlight",
  REJECTED: "bg-chip text-chip-foreground",
};

export const candidateStatusLabels: Record<CandidateStatus, string> = {
  ONBOARDING: "Onboarding",
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const companySizeColors: Record<CompanySize, string> = {
  STARTUP: "bg-chip text-chip-foreground",
  SMB: "bg-chip text-chip-foreground",
  ENTERPRISE: "bg-chip text-chip-foreground",
};

export const companySizeLabels: Record<CompanySize, string> = {
  STARTUP: "Startup",
  SMB: "SMB",
  ENTERPRISE: "Enterprise",
};

export const clientStatusColors: Record<ClientStatus, string> = {
  LEAD: "bg-chip text-chip-foreground",
  ACTIVE: "bg-highlight-muted text-highlight",
  CHURNED: "bg-chip text-chip-foreground",
};

export const clientStatusLabels: Record<ClientStatus, string> = {
  LEAD: "Lead",
  ACTIVE: "Active",
  CHURNED: "Churned",
};

export const clientOnboardingStatusColors: Record<ClientOnboardingStatus, string> = {
  ONBOARDING: "bg-chip text-chip-foreground",
  PENDING_REVIEW: "bg-chip text-chip-foreground",
  APPROVED: "bg-highlight-muted text-highlight",
  REJECTED: "bg-chip text-chip-foreground",
};

export const clientOnboardingStatusLabels: Record<ClientOnboardingStatus, string> = {
  ONBOARDING: "Onboarding",
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Job posting maps

export const jobStatusLabels: Record<JobStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  PAUSED: "Paused",
  FILLED: "Filled",
  CLOSED: "Closed",
  EXPIRED: "Expired",
};

export const jobStatusColors: Record<JobStatus, string> = {
  DRAFT: "bg-chip text-chip-foreground",
  OPEN: "bg-highlight-muted text-highlight",
  PAUSED: "bg-chip text-chip-foreground",
  FILLED: "bg-highlight-muted text-highlight",
  CLOSED: "bg-chip text-chip-foreground",
  EXPIRED: "bg-chip text-chip-foreground",
};

export const experienceLevelLabels: Record<ExperienceLevel, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Mid-Level",
  SENIOR: "Senior",
  STAFF: "Staff",
  PRINCIPAL: "Principal",
  LEAD: "Lead",
  MANAGER: "Manager",
};

export const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
};

export const workArrangementLabels: Record<WorkArrangement, string> = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE_LOCAL: "Remote (Local)",
  REMOTE_GLOBAL: "Remote (Global)",
};

export const jobUrgencyLabels: Record<JobUrgency, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  INVITED: "Invited",
  INTERVIEW: "Interview",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export const applicationStatusColors: Record<ApplicationStatus, string> = {
  APPLIED: "bg-chip text-chip-foreground",
  INVITED: "bg-chip text-chip-foreground",
  INTERVIEW: "bg-chip text-chip-foreground",
  HIRED: "bg-highlight-muted text-highlight",
  REJECTED: "bg-chip text-chip-foreground",
};

export const roleTypeOptions = [
  "Frontend",
  "Backend",
  "Full-Stack",
  "DevOps",
  "Mobile",
  "AI/ML",
  "Data",
  "QA/Testing",
  "Security",
  "Platform",
];

export const commonBenefits = [
  "Health Insurance",
  "Dental Insurance",
  "Vision Insurance",
  "401(k) / Pension",
  "Unlimited PTO",
  "Flexible Hours",
  "Remote Work",
  "Learning Budget",
  "Conference Budget",
  "Home Office Stipend",
  "Gym Membership",
  "Mental Health Support",
  "Parental Leave",
  "Stock Options",
  "Annual Bonus",
  "Relocation Assistance",
];

export const currencyOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (\u20AC)" },
  { value: "GBP", label: "GBP (\u00A3)" },
  { value: "CHF", label: "CHF" },
  { value: "CAD", label: "CAD ($)" },
  { value: "AUD", label: "AUD ($)" },
];

export const salaryPeriodOptions = [
  { value: "YEARLY", label: "Per Year" },
  { value: "MONTHLY", label: "Per Month" },
  { value: "HOURLY", label: "Per Hour" },
];

export function getScoreColor(score: number): string {
  if (score >= 4.5) return "text-green-600";
  if (score >= 4.0) return "text-green-500";
  if (score >= 3.5) return "text-blue-600";
  if (score >= 3.0) return "text-yellow-600";
  if (score >= 2.5) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBgColor(score: number): string {
  if (score >= 4.5) return "bg-green-100";
  if (score >= 4.0) return "bg-green-50";
  if (score >= 3.5) return "bg-blue-50";
  if (score >= 3.0) return "bg-yellow-50";
  if (score >= 2.5) return "bg-orange-50";
  return "bg-red-50";
}

export function getPassThreshold(difficulty: Difficulty): number {
  const thresholds: Record<Difficulty, number> = {
    INTERN: 3.0,
    JUNIOR: 3.5,
    MID: 4.0,
  };
  return thresholds[difficulty];
}
