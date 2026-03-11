"use client";

import { api } from "@/trpc/react";
import { applicationStatusLabels } from "@/lib/utils";
import { JobRow } from "./JobRow";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import type { ApplicationStatus } from "@codetalent/db";

const columns: ApplicationStatus[] = [
  "APPLIED",
  "INVITED",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
];

export function KanbanBoard() {
  const { data: overview, isLoading } =
    api.application.clientOverview.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Column headers skeleton */}
        <div className="grid grid-cols-5 gap-4">
          {columns.map((status) => (
            <div key={status} className="h-5 w-20 bg-muted animate-pulse rounded" />
          ))}
        </div>
        {/* Row skeletons */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  const jobs = overview?.jobs ?? [];

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Briefcase className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No jobs with applications yet
        </p>
        <Link
          href="/client/jobs"
          className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-all duration-200"
        >
          Go to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Column headers */}
      <div className="grid grid-cols-5 gap-4 px-1">
        {columns.map((status) => {
          const count = overview?.statusCounts[status] ?? 0;
          return (
            <div
              key={status}
              className="flex items-center justify-between pb-3 border-b-2 border-foreground/10"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {applicationStatusLabels[status]}
              </span>
              <span className="text-xs font-bold tabular-nums text-foreground">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Job rows */}
      <div className="grid grid-cols-5 gap-y-3">
        {jobs.map((job) => (
          <JobRow
            key={job.id}
            jobId={job.id}
            jobTitle={job.title}
            jobStatus={job.status}
            applicationCount={job.applicationCount}
            statusBreakdown={job.statusBreakdown}
          />
        ))}
      </div>
    </div>
  );
}
