"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  applicationStatusLabels,
  availabilityColors,
  availabilityLabels,
  formatDate,
} from "@/lib/utils";
import {
  Github,
  Linkedin,
  FileText,
  MapPin,
  ArrowRight,
  XCircle,
} from "lucide-react";
import type { ApplicationStatus, Availability } from "@prisma/client";

interface ApplicationUser {
  id: string;
  name: string | null;
  skills: string[];
  location: string | null;
  availability: Availability;
  githubUrl: string | null;
  linkedinUrl: string | null;
}

interface ApplicationData {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  appliedAt: Date;
  user: ApplicationUser;
}

const quickActions: Record<
  ApplicationStatus,
  { label: string; target: ApplicationStatus; icon: React.ElementType; variant?: "default" | "destructive" }[]
> = {
  APPLIED: [
    { label: "Invite", target: "INVITED", icon: ArrowRight },
    { label: "Reject", target: "REJECTED", icon: XCircle, variant: "destructive" },
  ],
  INVITED: [
    { label: "Interview", target: "INTERVIEW", icon: ArrowRight },
    { label: "Reject", target: "REJECTED", icon: XCircle, variant: "destructive" },
  ],
  INTERVIEW: [
    { label: "Hire", target: "HIRED", icon: ArrowRight },
    { label: "Reject", target: "REJECTED", icon: XCircle, variant: "destructive" },
  ],
  HIRED: [],
  REJECTED: [],
};

interface ApplicationCardProps {
  application: ApplicationData;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
  isPending?: boolean;
}

export function ApplicationCard({
  application,
  onStatusChange,
  isPending,
}: ApplicationCardProps) {
  const app = application;
  const actions = quickActions[app.status];

  return (
    <Card className={`transition-opacity ${isPending ? "opacity-60" : ""}`}>
      <CardContent className="pt-4 pb-3 px-4 space-y-3">
        {/* Name + location */}
        <div>
          <p className="font-medium text-sm">{app.user.name ?? "Unknown"}</p>
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
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {app.user.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{app.user.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Availability + date */}
        <div className="flex items-center justify-between text-xs">
          <Badge className={`text-xs ${availabilityColors[app.user.availability]}`}>
            {availabilityLabels[app.user.availability]}
          </Badge>
          <span className="text-muted-foreground">
            {formatDate(app.appliedAt)}
          </span>
        </div>

        {/* Links row */}
        <div className="flex items-center gap-1">
          {app.coverLetter && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <FileText className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Cover Letter — {app.user.name}</DialogTitle>
                </DialogHeader>
                <p className="whitespace-pre-wrap text-sm">{app.coverLetter}</p>
              </DialogContent>
            </Dialog>
          )}
          {app.user.githubUrl && (
            <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
              <a
                href={app.user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {app.user.linkedinUrl && (
            <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
              <a
                href={app.user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>

        {/* Quick actions */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t">
            {actions.map((action) => (
              <Button
                key={action.target}
                variant={action.variant === "destructive" ? "destructive" : "outline"}
                size="sm"
                className="h-7 text-xs flex-1"
                disabled={isPending}
                onClick={() => onStatusChange(app.id, action.target)}
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Fallback select for arbitrary changes */}
        <Select
          value={app.status}
          onValueChange={(v) => onStatusChange(app.id, v as ApplicationStatus)}
          disabled={isPending}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(applicationStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
