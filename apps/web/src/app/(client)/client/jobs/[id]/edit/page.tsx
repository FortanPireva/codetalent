"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { JobForm, type JobFormData } from "../../_components/JobForm";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const utils = api.useUtils();

  const { data: job, isLoading } = api.job.getById.useQuery({ id });

  const updateMutation = api.job.update.useMutation({
    onSuccess: () => {
      toast.success("Job updated");
      void utils.job.getById.invalidate({ id });
      void utils.job.list.invalidate();
      router.push(`/client/jobs/${id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const statusMutation = api.job.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Job published!");
      void utils.job.getById.invalidate({ id });
      void utils.job.list.invalidate();
      void utils.job.getStats.invalidate();
      router.push(`/client/jobs/${id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (data: JobFormData, publish: boolean) => {
    // If publish is requested and job is currently a draft, update then change status
    if (publish && job?.status === "DRAFT") {
      updateMutation.mutate(
        { id, ...data },
        {
          onSuccess: () => {
            statusMutation.mutate({ id, status: "OPEN" });
          },
        }
      );
    } else {
      updateMutation.mutate({ id, ...data });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
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

  if (["FILLED", "CLOSED", "EXPIRED"].includes(job.status)) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">This job cannot be edited</h2>
        <p className="text-muted-foreground mt-1">
          Jobs that are filled, closed, or expired cannot be modified.
        </p>
        <Button asChild className="mt-4">
          <Link href={`/client/jobs/${id}`}>View Job</Link>
        </Button>
      </div>
    );
  }

  const defaultValues: Partial<JobFormData> = {
    title: job.title,
    roleType: job.roleType ?? undefined,
    experienceLevel: job.experienceLevel ?? undefined,
    employmentType: job.employmentType ?? undefined,
    summary: job.summary ?? "",
    requiredSkills: job.requiredSkills,
    preferredSkills: job.preferredSkills,
    frameworks: job.frameworks,
    databases: job.databases,
    cloud: job.cloud,
    tools: job.tools,
    techStack: job.techStack,
    yearsMin: job.yearsMin ?? undefined,
    yearsMax: job.yearsMax ?? undefined,
    workArrangement: job.workArrangement ?? undefined,
    location: job.location ?? "",
    timezone: job.timezone ?? "",
    relocation: job.relocation,
    visaSponsorship: job.visaSponsorship,
    showSalary: job.showSalary,
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    salaryCurrency: job.salaryCurrency,
    salaryPeriod: job.salaryPeriod,
    equity: job.equity,
    equityRange: job.equityRange ?? "",
    bonus: job.bonus ?? "",
    benefits: job.benefits,
    description: job.description ?? "",
    responsibilities: job.responsibilities ?? "",
    requirements: job.requirements ?? "",
    niceToHave: job.niceToHave ?? "",
    interviewStages: job.interviewStages,
    interviewLength: job.interviewLength ?? "",
    headcount: job.headcount,
    urgency: job.urgency,
    startsAt: job.startsAt ? new Date(job.startsAt).toISOString().split("T")[0] : "",
    closesAt: job.closesAt ? new Date(job.closesAt).toISOString().split("T")[0] : "",
    tags: job.tags,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/client/jobs/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
        <p className="text-muted-foreground">Update your job posting</p>
      </div>
      <JobForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending || statusMutation.isPending}
        mode="edit"
      />
    </div>
  );
}
