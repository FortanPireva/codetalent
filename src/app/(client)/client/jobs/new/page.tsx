"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { JobForm, type JobFormData } from "../_components/JobForm";

export default function NewJobPage() {
  const router = useRouter();
  const utils = api.useUtils();

  const createMutation = api.job.create.useMutation({
    onSuccess: (job) => {
      toast.success(
        job.status === "OPEN" ? "Job published!" : "Job saved as draft"
      );
      void utils.job.list.invalidate();
      void utils.job.getStats.invalidate();
      router.push(`/client/jobs/${job.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: JobFormData, publish: boolean) => {
    createMutation.mutate({ ...data, publish });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post New Job</h1>
        <p className="text-muted-foreground">
          Create a new job posting to find developers
        </p>
      </div>
      <JobForm
        onSubmit={handleSubmit}
        isPending={createMutation.isPending}
        mode="create"
      />
    </div>
  );
}
