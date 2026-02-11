"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  jobStatusColors,
  jobStatusLabels,
  applicationStatusColors,
  applicationStatusLabels,
} from "@/lib/utils";
import { Briefcase } from "lucide-react";
import type { JobStatus, ApplicationStatus } from "@prisma/client";

const statuses: ApplicationStatus[] = [
  "APPLIED",
  "INVITED",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
];

interface JobOverview {
  id: string;
  title: string;
  status: JobStatus;
  applicationCount: number;
  statusBreakdown: Record<string, number>;
}

interface JobApplicationGridProps {
  jobs: JobOverview[];
  onSelectJob: (jobId: string) => void;
  isLoading?: boolean;
}

export function JobApplicationGrid({
  jobs,
  onSelectJob,
  isLoading,
}: JobApplicationGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-24 bg-gray-100 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-2">No jobs with applications yet</p>
          <Link
            href="/client/jobs"
            className="text-sm text-primary hover:underline"
          >
            Go to Jobs to create or manage postings
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <Card
          key={job.id}
          className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
          onClick={() => onSelectJob(job.id)}
        >
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                {job.title}
              </h3>
              <Badge className={`shrink-0 ${jobStatusColors[job.status]}`}>
                {jobStatusLabels[job.status]}
              </Badge>
            </div>
            <p className="text-2xl font-bold">{job.applicationCount}</p>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((status) => {
                const count = job.statusBreakdown[status];
                if (!count) return null;
                return (
                  <Badge
                    key={status}
                    variant="secondary"
                    className={`text-xs ${applicationStatusColors[status]}`}
                  >
                    {applicationStatusLabels[status]}: {count}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
