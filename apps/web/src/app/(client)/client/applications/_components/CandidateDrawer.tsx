"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  applicationStatusLabels,
  availabilityLabels,
  formatDate,
} from "@/lib/utils";
import {
  Github,
  Linkedin,
  FileText,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  X,
  ExternalLink,
  User,
  MessageSquare,
} from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import type { ApplicationData } from "./ApplicationCard";
import type { ApplicationStatus } from "@codetalent/db";

const quickActions: Record<
  ApplicationStatus,
  { label: string; target: ApplicationStatus; variant: "advance" | "reject" }[]
> = {
  APPLIED: [
    { label: "Invite to Apply", target: "INVITED", variant: "advance" },
    { label: "Reject", target: "REJECTED", variant: "reject" },
  ],
  INVITED: [
    { label: "Move to Interview", target: "INTERVIEW", variant: "advance" },
    { label: "Reject", target: "REJECTED", variant: "reject" },
  ],
  INTERVIEW: [
    { label: "Hire Candidate", target: "HIRED", variant: "advance" },
    { label: "Reject", target: "REJECTED", variant: "reject" },
  ],
  HIRED: [],
  REJECTED: [],
};

interface CandidateDrawerProps {
  application: ApplicationData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
  isPending?: boolean;
}

export function CandidateDrawer({
  application,
  open,
  onOpenChange,
  onStatusChange,
  isPending,
}: CandidateDrawerProps) {
  const router = useRouter();
  const getOrCreateThread = api.messages.getOrCreateThread.useMutation({
    onSuccess: (data) => {
      router.push(`/client/messages/${data.threadId}`);
    },
  });

  if (!application) return null;

  const app = application;
  const user = app.user;
  const actions = quickActions[app.status];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-md w-full overflow-y-auto border-l border-border/60 bg-background p-0"
      >
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-border/60">
          <div className="flex items-start gap-3">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name ?? "Candidate"}
                className="h-10 w-10 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-foreground text-background font-bold text-sm shrink-0">
                {user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-bold tracking-tight flex items-center gap-1.5">
                {user.name ?? "Unknown"}
                <VerifiedBadge passedCount={user.passedCount ?? 0} />
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-0.5">
                {user.email}
              </SheetDescription>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2 mt-3">
            <Badge className="bg-foreground text-background font-medium text-xs rounded-md">
              {applicationStatusLabels[app.status]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Applied {formatDate(app.appliedAt)}
            </span>
          </div>
        </SheetHeader>

        {/* Action buttons */}
        {actions.length > 0 && (
          <div className="px-6 py-4 border-b border-border/60 space-y-2">
            {actions.map((action) => (
              <Button
                key={action.target}
                size="sm"
                disabled={isPending}
                onClick={() => onStatusChange(app.id, action.target)}
                className={`w-full h-9 text-sm font-medium transition-all duration-200 ${
                  action.variant === "advance"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-transparent border border-red-300 text-red-600 hover:bg-red-50"
                }`}
              >
                {action.variant === "advance" ? (
                  <ArrowRight className="h-3.5 w-3.5 mr-2" />
                ) : (
                  <X className="h-3.5 w-3.5 mr-2" />
                )}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Message button */}
        <div className="px-6 py-3 border-b border-border/60">
          <Button
            variant="outline"
            className="w-full"
            disabled={getOrCreateThread.isPending}
            onClick={() =>
              getOrCreateThread.mutate({ applicationId: app.id })
            }
          >
            <MessageSquare className="h-3.5 w-3.5 mr-2" />
            Message Candidate
          </Button>
        </div>

        {/* Candidate details */}
        <div className="px-6 py-5 space-y-6">
          {/* Contact info */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Contact
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </section>

          {/* Links */}
          {(user.githubUrl || user.linkedinUrl || user.resumeUrl) && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Links
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.githubUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium border-foreground/15 hover:bg-foreground/5"
                    asChild
                  >
                    <a href={user.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-3.5 w-3.5 mr-1.5" />
                      GitHub
                      <ExternalLink className="h-3 w-3 ml-1.5 text-muted-foreground" />
                    </a>
                  </Button>
                )}
                {user.linkedinUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium border-foreground/15 hover:bg-foreground/5"
                    asChild
                  >
                    <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-3.5 w-3.5 mr-1.5" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3 ml-1.5 text-muted-foreground" />
                    </a>
                  </Button>
                )}
                {user.resumeUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium border-foreground/15 hover:bg-foreground/5"
                    asChild
                  >
                    <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      Resume
                      <ExternalLink className="h-3 w-3 ml-1.5 text-muted-foreground" />
                    </a>
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* Availability */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Availability
            </h3>
            <Badge className="bg-muted text-muted-foreground font-medium text-xs rounded-md border-0">
              {availabilityLabels[user.availability]}
            </Badge>
          </section>

          {/* Skills */}
          {user.skills.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-xs font-medium border-foreground/15 text-foreground rounded-md"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Bio */}
          {user.bio && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                About
              </h3>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {user.bio}
              </p>
            </section>
          )}

          {/* Cover letter */}
          {app.coverLetter && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Cover Letter
              </h3>
              <div className="rounded-lg border border-border/60 p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {app.coverLetter}
                </p>
              </div>
            </section>
          )}

          {/* Meta */}
          <section className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Applied {formatDate(app.appliedAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Joined {formatDate(user.createdAt)}
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
