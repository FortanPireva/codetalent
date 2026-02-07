"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  jobStatusLabels,
  jobStatusColors,
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
  jobUrgencyLabels,
  salaryPeriodOptions,
  formatDate,
} from "@/lib/utils";
import {
  ArrowLeft,
  Pencil,
  Pause,
  Play,
  XCircle,
  Trash2,
  Eye,
  Users,
  UserCheck,
  Target,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { JobStatus } from "@prisma/client";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const utils = api.useUtils();

  const { data: job, isLoading } = api.job.getById.useQuery({ id });

  const statusMutation = api.job.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Job status updated");
      void utils.job.getById.invalidate({ id });
      void utils.job.list.invalidate();
      void utils.job.getStats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = api.job.delete.useMutation({
    onSuccess: () => {
      toast.success("Job deleted");
      void utils.job.list.invalidate();
      void utils.job.getStats.invalidate();
      router.push("/client/jobs");
    },
    onError: (e) => toast.error(e.message),
  });

  const changeStatus = (status: JobStatus) => {
    statusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-gray-100 animate-pulse rounded" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Job not found</h2>
        <Button asChild className="mt-4">
          <Link href="/client/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  const salaryRange =
    job.showSalary && job.salaryMin && job.salaryMax
      ? `${job.salaryCurrency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
      : job.showSalary && job.salaryMin
        ? `From ${job.salaryCurrency} ${job.salaryMin.toLocaleString()}`
        : null;

  const salaryPeriodLabel = salaryPeriodOptions.find(
    (o) => o.value === job.salaryPeriod
  )?.label;

  const canEdit = !["FILLED", "CLOSED", "EXPIRED"].includes(job.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/client/jobs">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <Badge className={jobStatusColors[job.status]}>
              {jobStatusLabels[job.status]}
            </Badge>
          </div>
          {job.roleType && (
            <p className="text-muted-foreground">{job.roleType}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/client/jobs/${job.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
          {job.status === "DRAFT" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Publish this job?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will make the job visible and open for applications.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => changeStatus("OPEN")}>
                    Publish
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {job.status === "OPEN" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Pause this job?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will temporarily hide the job from new applicants. You
                    can resume it later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => changeStatus("PAUSED")}>
                    Pause
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {job.status === "PAUSED" && (
            <Button onClick={() => changeStatus("OPEN")}>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          {["OPEN", "PAUSED", "FILLED"].includes(job.status) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Close this job?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Closing a job is permanent. It will no longer accept
                    applications.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => changeStatus("CLOSED")}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Close Job
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {job.status === "OPEN" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Filled
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark as filled?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This indicates the position has been filled. You can reopen
                    it later if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => changeStatus("FILLED")}>
                    Mark Filled
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {job.status === "DRAFT" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The job posting will be
                    permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate({ id })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{job.viewCount}</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{job.applicationCount}</p>
                <p className="text-xs text-muted-foreground">Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{job.headcount}</p>
                <p className="text-xs text-muted-foreground">Headcount</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{job.filledCount}</p>
                <p className="text-xs text-muted-foreground">Filled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details grid */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {job.experienceLevel && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Experience Level
                </p>
                <p className="font-medium">
                  {experienceLevelLabels[job.experienceLevel]}
                </p>
              </div>
            )}
            {job.employmentType && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Employment Type
                  </p>
                  <p className="font-medium">
                    {employmentTypeLabels[job.employmentType]}
                  </p>
                </div>
              </div>
            )}
            {job.workArrangement && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Work Arrangement
                  </p>
                  <p className="font-medium">
                    {workArrangementLabels[job.workArrangement]}
                  </p>
                </div>
              </div>
            )}
            {job.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <p className="font-medium">{job.location}</p>
              </div>
            )}
            {job.timezone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Timezone
                </p>
                <p className="font-medium">{job.timezone}</p>
              </div>
            )}
            {(job.yearsMin !== null || job.yearsMax !== null) && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Experience
                </p>
                <p className="font-medium">
                  {job.yearsMin ?? 0} - {job.yearsMax ?? "∞"} years
                </p>
              </div>
            )}
            {salaryRange && (
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Compensation
                  </p>
                  <p className="font-medium">
                    {salaryRange} {salaryPeriodLabel}
                  </p>
                </div>
              </div>
            )}
            {job.equity && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Equity
                </p>
                <p className="font-medium">{job.equityRange || "Yes"}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Urgency
              </p>
              <p className="font-medium">{jobUrgencyLabels[job.urgency]}</p>
            </div>
            {job.relocation && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Relocation
                </p>
                <p className="font-medium">Assistance available</p>
              </div>
            )}
            {job.visaSponsorship && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Visa Sponsorship
                </p>
                <p className="font-medium">Available</p>
              </div>
            )}
            {job.publishedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Published
                </p>
                <p className="font-medium">{formatDate(job.publishedAt)}</p>
              </div>
            )}
            {job.closesAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Closes
                </p>
                <p className="font-medium">{formatDate(job.closesAt)}</p>
              </div>
            )}
            {job.startsAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Starts
                </p>
                <p className="font-medium">{formatDate(job.startsAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills sections */}
      {(job.requiredSkills.length > 0 || job.preferredSkills.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.requiredSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Required
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {job.preferredSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Preferred
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.preferredSkills.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tech stack */}
      {(job.frameworks.length > 0 ||
        job.databases.length > 0 ||
        job.cloud.length > 0 ||
        job.tools.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.frameworks.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Frameworks
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.frameworks.map((f) => (
                    <Badge key={f} variant="secondary">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {job.databases.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Databases
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.databases.map((d) => (
                    <Badge key={d} variant="secondary">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {job.cloud.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Cloud / Infrastructure
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.cloud.map((c) => (
                    <Badge key={c} variant="secondary">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {job.tools.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Tools
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.tools.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {(job.description || job.responsibilities || job.requirements || job.niceToHave) && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {job.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Overview
                </p>
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            )}
            {job.responsibilities && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Responsibilities
                </p>
                <p className="whitespace-pre-wrap">{job.responsibilities}</p>
              </div>
            )}
            {job.requirements && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Requirements
                </p>
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </div>
            )}
            {job.niceToHave && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Nice to Have
                </p>
                <p className="whitespace-pre-wrap">{job.niceToHave}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interview process */}
      {job.interviewStages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Process</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {job.interviewStages.map((stage, i) => (
                <li key={stage} className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {i + 1}
                  </span>
                  <span>{stage}</span>
                </li>
              ))}
            </ol>
            {job.interviewLength && (
              <p className="text-sm text-muted-foreground mt-4">
                Expected timeline: {job.interviewLength}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((b) => (
                <Badge key={b} variant="secondary">
                  {b}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
