"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { ApplicationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  applicationStatusLabels,
  applicationStatusColors,
  formatDate,
} from "@/lib/utils";
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  X,
} from "lucide-react";
import { toast } from "sonner";

const COLUMNS: ApplicationStatus[] = [
  "APPLIED",
  "INVITED",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
];

const COLUMN_DOT_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: "bg-blue-500",
  INVITED: "bg-purple-500",
  INTERVIEW: "bg-yellow-500",
  HIRED: "bg-green-500",
  REJECTED: "bg-red-500",
};

export default function ApplicationsPage() {
  const utils = api.useUtils();
  const { data: applications, isLoading } =
    api.application.myApplications.useQuery();

  const withdrawMutation = api.application.withdraw.useMutation({
    onSuccess: () => {
      toast.success("Application withdrawn");
      void utils.application.myApplications.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const grouped = useMemo(() => {
    const map: Record<ApplicationStatus, typeof applications> = {
      APPLIED: [],
      INVITED: [],
      INTERVIEW: [],
      HIRED: [],
      REJECTED: [],
    };
    if (!applications) return map;
    for (const app of applications) {
      map[app.status]?.push(app);
    }
    return map;
  }, [applications]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your job applications
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col} className="w-72 lg:w-80 shrink-0">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="space-y-3">
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalApplications = applications?.length ?? 0;

  if (totalApplications === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your job applications
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">No applications yet</p>
            <p className="text-muted-foreground text-sm mb-4">
              Start browsing open positions and apply to your first job
            </p>
            <Button asChild>
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications ({totalApplications} total)
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => {
          const items = grouped[status] ?? [];
          return (
            <div key={status} className="w-72 lg:w-80 shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${COLUMN_DOT_COLORS[status]}`}
                />
                <span className="text-sm font-medium">
                  {applicationStatusLabels[status]}
                </span>
                <Badge variant="secondary" className="text-xs ml-auto">
                  {items.length}
                </Badge>
              </div>

              <div className="space-y-3 bg-gray-50 rounded-lg p-3 min-h-[200px]">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No applications
                  </p>
                ) : (
                  items.map((app) => {
                    const job = app.job;
                    const hasSalary =
                      job.showSalary &&
                      job.salaryMin != null &&
                      job.salaryMax != null;

                    return (
                      <Card key={app.id} className="shadow-sm">
                        <CardContent className="p-4 space-y-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-sm font-semibold hover:text-primary hover:underline line-clamp-2"
                          >
                            {job.title}
                          </Link>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {job.client.name}
                            </span>
                          </div>

                          {job.client.location && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {job.client.location}
                              </span>
                            </div>
                          )}

                          {hasSalary && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <DollarSign className="h-3 w-3 shrink-0" />
                              <span>
                                {job.salaryCurrency}{" "}
                                {job.salaryMin!.toLocaleString()} –{" "}
                                {job.salaryMax!.toLocaleString()}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>Applied {formatDate(app.appliedAt)}</span>
                          </div>

                          {app.status === "APPLIED" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 mt-1"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Withdraw
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Withdraw application?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will withdraw your application for{" "}
                                    <strong>{job.title}</strong> at{" "}
                                    {job.client.name}. This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      withdrawMutation.mutate({
                                        applicationId: app.id,
                                      })
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Withdraw
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
