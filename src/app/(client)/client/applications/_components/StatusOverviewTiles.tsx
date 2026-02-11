"use client";

import { Card, CardContent } from "@/components/ui/card";
import { applicationStatusColors, applicationStatusLabels } from "@/lib/utils";
import { Users, Inbox, Mail, Calendar, CheckCircle, XCircle } from "lucide-react";
import type { ApplicationStatus } from "@prisma/client";

const statusIcons: Record<ApplicationStatus, React.ElementType> = {
  APPLIED: Inbox,
  INVITED: Mail,
  INTERVIEW: Calendar,
  HIRED: CheckCircle,
  REJECTED: XCircle,
};

const statuses: ApplicationStatus[] = [
  "APPLIED",
  "INVITED",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
];

interface StatusOverviewTilesProps {
  statusCounts: Record<string, number>;
  totalApplications: number;
  isLoading?: boolean;
}

export function StatusOverviewTiles({
  statusCounts,
  totalApplications,
  isLoading,
}: StatusOverviewTilesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-12 bg-gray-100 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <Users className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalApplications}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {statuses.map((status) => {
        const Icon = statusIcons[status];
        const colorClass = applicationStatusColors[status];
        return (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {statusCounts[status] ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {applicationStatusLabels[status]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
