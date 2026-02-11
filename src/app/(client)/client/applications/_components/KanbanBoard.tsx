"use client";

import { api } from "@/trpc/react";
import { applicationStatusColors, applicationStatusLabels } from "@/lib/utils";
import { ApplicationCard } from "./ApplicationCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { ApplicationStatus } from "@prisma/client";

const columns: ApplicationStatus[] = [
  "APPLIED",
  "INVITED",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
];

const columnBorderColors: Record<ApplicationStatus, string> = {
  APPLIED: "border-t-blue-400",
  INVITED: "border-t-purple-400",
  INTERVIEW: "border-t-yellow-400",
  HIRED: "border-t-green-400",
  REJECTED: "border-t-red-400",
};

interface KanbanBoardProps {
  jobId: string;
}

export function KanbanBoard({ jobId }: KanbanBoardProps) {
  const utils = api.useUtils();

  const { data: applications, isLoading } = api.application.listForJob.useQuery(
    { jobId }
  );

  const updateStatus = api.application.updateStatus.useMutation({
    onMutate: async ({ applicationId, status }) => {
      // Cancel outgoing refetches
      await utils.application.listForJob.cancel({ jobId });

      // Snapshot previous data
      const previous = utils.application.listForJob.getData({ jobId });

      // Optimistically update
      utils.application.listForJob.setData({ jobId }, (old) => {
        if (!old) return old;
        return old.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        );
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Revert on error
      if (context?.previous) {
        utils.application.listForJob.setData({ jobId }, context.previous);
      }
      toast.error("Failed to update application status");
    },
    onSettled: () => {
      void utils.application.listForJob.invalidate({ jobId });
      void utils.application.clientOverview.invalidate();
    },
    onSuccess: () => {
      toast.success("Status updated");
    },
  });

  const handleStatusChange = (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    updateStatus.mutate({ applicationId, status });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => (
          <div key={status} className="min-w-[280px] flex-1">
            <Card className={`border-t-4 ${columnBorderColors[status]}`}>
              <CardContent className="pt-4 space-y-3">
                <div className="h-6 w-24 bg-gray-100 animate-pulse rounded" />
                <div className="h-32 bg-gray-100 animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  // Group by status
  const grouped: Record<ApplicationStatus, typeof applications> = {
    APPLIED: [],
    INVITED: [],
    INTERVIEW: [],
    HIRED: [],
    REJECTED: [],
  };

  for (const app of applications ?? []) {
    grouped[app.status]?.push(app);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((status) => {
        const items = grouped[status] ?? [];
        return (
          <div key={status} className="min-w-[280px] flex-1">
            <Card className={`border-t-4 ${columnBorderColors[status]}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">
                    {applicationStatusLabels[status]}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={applicationStatusColors[status]}
                  >
                    {items.length}
                  </Badge>
                </div>
                <div className="space-y-3 min-h-[100px]">
                  <AnimatePresence mode="popLayout">
                    {items.map((app) => (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ApplicationCard
                          application={app}
                          onStatusChange={handleStatusChange}
                          isPending={
                            updateStatus.isPending &&
                            updateStatus.variables?.applicationId === app.id
                          }
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      No candidates
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
