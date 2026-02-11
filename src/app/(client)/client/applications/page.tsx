"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { StatusOverviewTiles } from "./_components/StatusOverviewTiles";
import { JobApplicationGrid } from "./_components/JobApplicationGrid";
import { KanbanBoard } from "./_components/KanbanBoard";

function ApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedJobId = searchParams.get("job");

  const { data: overview, isLoading } =
    api.application.clientOverview.useQuery();

  const selectedJob = overview?.jobs.find((j) => j.id === selectedJobId);

  const handleSelectJob = (jobId: string) => {
    router.push(`/client/applications?job=${jobId}`);
  };

  const handleBack = () => {
    router.push("/client/applications");
  };

  // Kanban view for a specific job
  if (selectedJobId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Applications
          </Button>
          {selectedJob && (
            <h1 className="text-2xl font-bold tracking-tight">
              {selectedJob.title}
            </h1>
          )}
        </div>
        <KanbanBoard jobId={selectedJobId} />
      </div>
    );
  }

  // Overview
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-7 w-7 text-muted-foreground" />
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
      </div>

      <StatusOverviewTiles
        statusCounts={overview?.statusCounts ?? {}}
        totalApplications={overview?.totalApplications ?? 0}
        isLoading={isLoading}
      />

      <div>
        <h2 className="text-lg font-semibold mb-4">Jobs</h2>
        <JobApplicationGrid
          jobs={overview?.jobs ?? []}
          onSelectJob={handleSelectJob}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 w-48 bg-gray-100 animate-pulse rounded" />
          <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
        </div>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}
