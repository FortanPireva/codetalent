"use client";

import { api } from "@/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Mail,
  Briefcase,
  Clock,
  Github,
  Linkedin,
  User,
  Building,
} from "lucide-react";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  APPLIED: { label: "Applied", variant: "secondary" },
  INVITED: { label: "Invited", variant: "default" },
  INTERVIEW: { label: "Interview", variant: "default" },
  HIRED: { label: "Hired", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

const availabilityLabels: Record<string, string> = {
  ACTIVELY_LOOKING: "Actively looking",
  OPEN_TO_OFFERS: "Open to offers",
  NOT_LOOKING: "Not looking",
};

function formatEnum(value: string | null | undefined) {
  if (!value) return null;
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ThreadDetailPanel({ threadId }: { threadId: string }) {
  const { data, isLoading } = api.messages.getThreadDetail.useQuery(
    { threadId },
    { staleTime: 30_000 },
  );

  if (isLoading) {
    return (
      <div className="w-80 border-l bg-card p-4 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  const { candidate, application } = data;
  const job = application?.job;

  const initials = candidate?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <div className="w-80 border-l bg-card overflow-y-auto flex-shrink-0">
      {/* Candidate Section */}
      <div className="p-4">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-16 w-16 mb-3">
            {candidate?.profilePicture && (
              <AvatarImage src={candidate.profilePicture} alt={candidate.name ?? ""} />
            )}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-base">{candidate?.name ?? "Unknown"}</h3>
          {candidate?.availability && (
            <span className="text-xs text-muted-foreground mt-1">
              {availabilityLabels[candidate.availability] ?? candidate.availability}
            </span>
          )}
        </div>

        {candidate?.bio && (
          <p className="text-xs text-muted-foreground mt-3 line-clamp-3">{candidate.bio}</p>
        )}

        <div className="mt-4 space-y-2">
          {candidate?.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
          )}
          {candidate?.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{candidate.location}</span>
            </div>
          )}
          {candidate?.githubUrl && (
            <a
              href={candidate.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">GitHub</span>
            </a>
          )}
          {candidate?.linkedinUrl && (
            <a
              href={candidate.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">LinkedIn</span>
            </a>
          )}
        </div>

        {candidate?.skills && candidate.skills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 8).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 8}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job Section */}
      {job && (
        <>
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Related Job
              </p>
            </div>
            <h4 className="font-medium text-sm">{job.title}</h4>

            <div className="mt-3 space-y-2">
              {job.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.employmentType && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{formatEnum(job.employmentType)}</span>
                </div>
              )}
              {job.workArrangement && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{formatEnum(job.workArrangement)}</span>
                </div>
              )}
              {job.experienceLevel && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{formatEnum(job.experienceLevel)}</span>
                </div>
              )}
            </div>

            {/* Application Status */}
            {application && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Application Status</p>
                <Badge variant={statusLabels[application.status]?.variant ?? "secondary"}>
                  {statusLabels[application.status]?.label ?? application.status}
                </Badge>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
