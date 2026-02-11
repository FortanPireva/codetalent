"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { ApplicationCard } from "./ApplicationCard";
import type { ApplicationData } from "./ApplicationCard";
import { CandidateDrawer } from "./CandidateDrawer";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ChevronRight, Briefcase } from "lucide-react";
import { jobStatusLabels } from "@/lib/utils";
import type { ApplicationStatus, JobStatus } from "@prisma/client";

const columns: ApplicationStatus[] = [
  "APPLIED",
  "INVITED",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
];

interface JobRowProps {
  jobId: string;
  jobTitle: string;
  jobStatus: JobStatus;
  applicationCount: number;
  statusBreakdown: Record<string, number>;
}

export function JobRow({
  jobId,
  jobTitle,
  jobStatus,
  applicationCount,
  statusBreakdown,
}: JobRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const utils = api.useUtils();

  const { data: applications, isLoading } =
    api.application.listForJob.useQuery({ jobId }, { enabled: expanded });

  const updateStatus = api.application.updateStatus.useMutation({
    onMutate: async ({ applicationId, status }) => {
      await utils.application.listForJob.cancel({ jobId });
      const previous = utils.application.listForJob.getData({ jobId });
      utils.application.listForJob.setData({ jobId }, (old) => {
        if (!old) return old;
        return old.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        );
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        utils.application.listForJob.setData({ jobId }, context.previous);
      }
      toast.error("Failed to update status");
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
    // Update the selected app in the drawer optimistically
    if (selectedApp?.id === applicationId) {
      setSelectedApp((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleCardClick = (app: ApplicationData) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  // Group fetched applications by status
  const grouped: Record<ApplicationStatus, NonNullable<typeof applications>> = {
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
    <div className="col-span-5">
      {/* Job tile — full-width row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-4 py-3 border border-border/60 rounded-lg transition-all duration-200 hover:border-foreground/15 hover:bg-foreground/[0.02] group"
      >
        <ChevronRight
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
        <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-bold tracking-tight truncate text-left flex-1">
          {jobTitle}
        </span>
        <Badge
          variant="outline"
          className="text-xs font-medium border-foreground/20 text-muted-foreground rounded-md shrink-0"
        >
          {jobStatusLabels[jobStatus]}
        </Badge>
        {/* Mini counts per status */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {columns.map((status) => {
            const count = statusBreakdown[status] ?? 0;
            return (
              <span
                key={status}
                className={`text-xs tabular-nums ${
                  count > 0
                    ? "font-bold text-foreground"
                    : "text-muted-foreground/50"
                }`}
              >
                {count}
              </span>
            );
          })}
        </div>
        <span className="text-xs font-bold text-foreground tabular-nums shrink-0 sm:hidden">
          {applicationCount}
        </span>
      </button>

      {/* Expanded — 5-column grid of application cards */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-5 gap-4 px-1 pt-3 pb-4">
              {isLoading
                ? columns.map((status) => (
                    <div key={status} className="space-y-2">
                      {Array.from({
                        length: Math.min(statusBreakdown[status] ?? 1, 2),
                      }).map((_, i) => (
                        <div
                          key={i}
                          className="h-28 bg-muted animate-pulse rounded-lg"
                        />
                      ))}
                    </div>
                  ))
                : columns.map((status) => {
                    const items = grouped[status];
                    return (
                      <div key={status} className="space-y-2 min-h-[60px]">
                        <AnimatePresence mode="popLayout">
                          {items.map((app) => (
                            <motion.div
                              key={app.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <ApplicationCard
                                application={app}
                                onClick={() => handleCardClick(app)}
                                onStatusChange={handleStatusChange}
                                isSelected={
                                  drawerOpen && selectedApp?.id === app.id
                                }
                                isPending={
                                  updateStatus.isPending &&
                                  updateStatus.variables?.applicationId ===
                                    app.id
                                }
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {items.length === 0 && (
                          <div className="flex items-center justify-center h-[60px] rounded-lg border border-dashed border-border/40">
                            <span className="text-xs text-muted-foreground/50">
                              —
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate detail drawer */}
      <CandidateDrawer
        application={selectedApp}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onStatusChange={handleStatusChange}
        isPending={updateStatus.isPending}
      />
    </div>
  );
}
