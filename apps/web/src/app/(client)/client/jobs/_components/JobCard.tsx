"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  jobStatusLabels,
  jobStatusColors,
  workArrangementLabels,
  employmentTypeLabels,
  formatDate,
} from "@/lib/utils";
import { Eye, Users, Pencil, MapPin, Clock } from "lucide-react";
import type { Job } from "@codetalent/db";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const salaryRange =
    job.showSalary && job.salaryMin && job.salaryMax
      ? `${job.salaryCurrency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / ${job.salaryPeriod === "YEARLY" ? "yr" : job.salaryPeriod === "MONTHLY" ? "mo" : "hr"}`
      : job.showSalary && job.salaryMin
        ? `From ${job.salaryCurrency} ${job.salaryMin.toLocaleString()}`
        : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <Link href={`/client/jobs/${job.id}`}>
              <CardTitle className="text-lg hover:text-primary transition-colors truncate">
                {job.title}
              </CardTitle>
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {job.roleType && <span>{job.roleType}</span>}
              {job.workArrangement && (
                <>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {workArrangementLabels[job.workArrangement]}
                  </span>
                </>
              )}
              {job.employmentType && (
                <>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {employmentTypeLabels[job.employmentType]}
                  </span>
                </>
              )}
            </div>
          </div>
          <Badge className={jobStatusColors[job.status]}>
            {jobStatusLabels[job.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {job.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.summary}
          </p>
        )}

        {salaryRange && (
          <p className="text-sm font-medium">{salaryRange}</p>
        )}

        {job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.requiredSkills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.requiredSkills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{job.requiredSkills.length - 5}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {job.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {job.applicationCount}
            </span>
            <span>
              {job.publishedAt
                ? `Posted ${formatDate(job.publishedAt)}`
                : `Created ${formatDate(job.createdAt)}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/client/jobs/${job.id}`}>View</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/client/jobs/${job.id}/edit`}>
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
