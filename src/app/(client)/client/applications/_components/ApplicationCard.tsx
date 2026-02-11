"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { MapPin, ArrowRight, X } from "lucide-react";
import type { ApplicationStatus, Availability } from "@prisma/client";

const availabilityLabel: Record<Availability, string> = {
  ACTIVELY_LOOKING: "Active",
  OPEN_TO_OFFERS: "Open",
  NOT_LOOKING: "Passive",
  HIRED: "Hired",
};

export interface ApplicationUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  bio: string | null;
  skills: string[];
  location: string | null;
  availability: Availability;
  githubUrl: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
  profilePicture: string | null;
  createdAt: Date;
}

export interface ApplicationData {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  appliedAt: Date;
  user: ApplicationUser;
}

const quickActions: Record<
  ApplicationStatus,
  { label: string; target: ApplicationStatus; variant: "advance" | "reject" }[]
> = {
  APPLIED: [
    { label: "Invite", target: "INVITED", variant: "advance" },
    { label: "Reject", target: "REJECTED", variant: "reject" },
  ],
  INVITED: [
    { label: "Interview", target: "INTERVIEW", variant: "advance" },
    { label: "Reject", target: "REJECTED", variant: "reject" },
  ],
  INTERVIEW: [
    { label: "Hire", target: "HIRED", variant: "advance" },
    { label: "Reject", target: "REJECTED", variant: "reject" },
  ],
  HIRED: [],
  REJECTED: [],
};

interface ApplicationCardProps {
  application: ApplicationData;
  onClick: () => void;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
  isSelected?: boolean;
  isPending?: boolean;
}

export function ApplicationCard({
  application,
  onClick,
  onStatusChange,
  isSelected,
  isPending,
}: ApplicationCardProps) {
  const app = application;
  const actions = quickActions[app.status];

  return (
    <div
      className={`rounded-lg border bg-background p-3 space-y-2 transition-all duration-200 ${
        isPending ? "opacity-50 pointer-events-none" : ""
      } ${
        isSelected
          ? "border-foreground/40 shadow-xs"
          : "border-border/60 hover:border-foreground/20"
      }`}
    >
      {/* Clickable area — opens drawer */}
      <button onClick={onClick} className="w-full text-left space-y-2">
        {/* Name + location */}
        <div>
          <p className="text-sm font-bold tracking-tight">
            {app.user.name ?? "Unknown"}
          </p>
          {app.user.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {app.user.location}
            </p>
          )}
        </div>

        {/* Skills */}
        {app.user.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {app.user.skills.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs font-medium border-foreground/15 text-foreground rounded-md"
              >
                {skill}
              </Badge>
            ))}
            {app.user.skills.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs font-medium border-foreground/15 text-muted-foreground rounded-md"
              >
                +{app.user.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Availability + date */}
        <div className="flex items-center justify-between text-xs">
          <Badge className="bg-muted text-muted-foreground font-medium text-xs rounded-md border-0">
            {availabilityLabel[app.user.availability]}
          </Badge>
          <span className="text-muted-foreground">
            {formatDate(app.appliedAt)}
          </span>
        </div>
      </button>

      {/* Action buttons */}
      {actions.length > 0 && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-border/60">
          {actions.map((action) => (
            <Button
              key={action.target}
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(app.id, action.target);
              }}
              className={`h-7 text-xs font-medium flex-1 transition-all duration-200 ${
                action.variant === "advance"
                  ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
                  : "border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              }`}
            >
              {action.variant === "advance" ? (
                <ArrowRight className="h-3 w-3 mr-1" />
              ) : (
                <X className="h-3 w-3 mr-1" />
              )}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
