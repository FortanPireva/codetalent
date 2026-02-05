import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SubmissionStatus, Difficulty, Availability } from "@prisma/client";

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
  ASSIGNED: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  SUBMITTED: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-purple-100 text-purple-800",
  PASSED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
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
  INTERN: "bg-green-100 text-green-800",
  JUNIOR: "bg-blue-100 text-blue-800",
  MID: "bg-purple-100 text-purple-800",
};

export const difficultyLabels: Record<Difficulty, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Mid-Level",
};

export const availabilityColors: Record<Availability, string> = {
  ACTIVELY_LOOKING: "bg-green-100 text-green-800",
  OPEN_TO_OFFERS: "bg-blue-100 text-blue-800",
  NOT_LOOKING: "bg-gray-100 text-gray-800",
  HIRED: "bg-purple-100 text-purple-800",
};

export const availabilityLabels: Record<Availability, string> = {
  ACTIVELY_LOOKING: "Actively Looking",
  OPEN_TO_OFFERS: "Open to Offers",
  NOT_LOOKING: "Not Looking",
  HIRED: "Hired",
};

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
