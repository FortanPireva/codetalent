"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
  formatDate,
  applicationStatusLabels,
  applicationStatusColors,
} from "@/lib/utils";
import { ExperienceLevel, EmploymentType, WorkArrangement } from "@prisma/client";
import {
  Search,
  MapPin,
  Building2,
  Clock,
  Briefcase,
  ArrowRight,
  DollarSign,
  CheckCircle,
} from "lucide-react";

export default function CandidateJobsPage() {
  const [search, setSearch] = useState("");
  const [experienceFilter, setExperienceFilter] = useState<ExperienceLevel | "ALL">("ALL");
  const [arrangementFilter, setArrangementFilter] = useState<WorkArrangement | "ALL">("ALL");
  const [employmentFilter, setEmploymentFilter] = useState<EmploymentType | "ALL">("ALL");

  const { data: applications } = api.application.myApplications.useQuery();
  const appliedJobIds = new Set(applications?.map((a) => a.jobId));

  const { data: jobs, isLoading } = api.job.candidateList.useQuery({
    search: search || undefined,
    experienceLevel: experienceFilter === "ALL" ? undefined : experienceFilter,
    workArrangement: arrangementFilter === "ALL" ? undefined : arrangementFilter,
    employmentType: employmentFilter === "ALL" ? undefined : employmentFilter,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Jobs</h1>
        <p className="text-muted-foreground">
          Browse open positions from top companies
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, summary, or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={experienceFilter}
                onValueChange={(v) => setExperienceFilter(v as ExperienceLevel | "ALL")}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Levels</SelectItem>
                  {Object.entries(experienceLevelLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={arrangementFilter}
                onValueChange={(v) => setArrangementFilter(v as WorkArrangement | "ALL")}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Work Arrangement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Arrangements</SelectItem>
                  {Object.entries(workArrangementLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={employmentFilter}
                onValueChange={(v) => setEmploymentFilter(v as EmploymentType | "ALL")}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {Object.entries(employmentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {jobs?.length ?? 0} open position{jobs?.length !== 1 ? "s" : ""}
      </p>

      {/* Job listings */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">No jobs found</p>
            <p className="text-muted-foreground text-sm">
              Try adjusting your filters or check back later
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs?.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-lg font-semibold hover:text-primary hover:underline truncate"
                      >
                        {job.title}
                      </Link>
                      {appliedJobIds.has(job.id) && (
                        <Badge className="bg-green-100 text-green-800 shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Applied
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span>{job.client.name}</span>
                      {job.location && (
                        <>
                          <span className="text-gray-300">|</span>
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{job.location}</span>
                        </>
                      )}
                    </div>

                    {job.summary && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {job.summary}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.roleType && (
                        <Badge variant="secondary">{job.roleType}</Badge>
                      )}
                      {job.experienceLevel && (
                        <Badge variant="outline">
                          {experienceLevelLabels[job.experienceLevel]}
                        </Badge>
                      )}
                      {job.workArrangement && (
                        <Badge variant="outline">
                          {workArrangementLabels[job.workArrangement]}
                        </Badge>
                      )}
                      {job.employmentType && (
                        <Badge variant="outline">
                          {employmentTypeLabels[job.employmentType]}
                        </Badge>
                      )}
                    </div>

                    {job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.requiredSkills.slice(0, 6).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.requiredSkills.length > 6 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.requiredSkills.length - 6}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {job.showSalary && job.salaryMin != null && job.salaryMax != null && (
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}{" "}
                        <span className="text-muted-foreground text-xs">
                          {job.salaryCurrency}/{job.salaryPeriod === "YEARLY" ? "yr" : job.salaryPeriod === "MONTHLY" ? "mo" : "hr"}
                        </span>
                      </div>
                    )}
                    {job.publishedAt && (
                      <p className="text-xs text-muted-foreground">
                        Posted {formatDate(job.publishedAt)}
                      </p>
                    )}
                    <Button size="sm" asChild>
                      <Link href={`/jobs/${job.id}`}>
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
