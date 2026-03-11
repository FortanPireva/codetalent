"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  availabilityColors,
  availabilityLabels,
  getScoreColor,
} from "@/lib/utils";
import {
  ArrowLeft,
  Github,
  Linkedin,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Briefcase,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/verified-badge";

export default function CandidateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const utils = api.useUtils();

  const { data: candidate, isLoading } =
    api.talentPool.clientGetCandidate.useQuery({ id });

  const { data: openJobs, isLoading: isLoadingJobs } =
    api.job.list.useQuery(
      { status: "OPEN" },
      { enabled: inviteOpen }
    );

  const inviteMutation = api.application.inviteForInterview.useMutation({
    onSuccess: () => {
      toast.success("Interview invitation sent successfully");
      setInviteOpen(false);
      setSelectedJobId(null);
      void utils.application.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        toast.error("This candidate already has an application for this job");
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleInvite = () => {
    if (!selectedJobId) return;
    inviteMutation.mutate({
      candidateId: id,
      jobId: selectedJobId,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-gray-100 animate-pulse rounded" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Candidate not found</h2>
        <Button asChild className="mt-4">
          <Link href="/client/talent">Back to Talent</Link>
        </Button>
      </div>
    );
  }

  const initials = candidate.name
    ? candidate.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/client/talent">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Talent
          </Link>
        </Button>
        <Button
          onClick={() => {
            setInviteOpen(true);
            setSelectedJobId(null);
          }}
          className="gap-1.5"
        >
          <Send className="h-4 w-4" />
          Invite to Interview
        </Button>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {candidate.profilePicture ? (
                <AvatarImage
                  src={candidate.profilePicture}
                  alt={candidate.name ?? "Candidate"}
                />
              ) : null}
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-1.5">
                {candidate.name ?? "Unknown"}
                <VerifiedBadge passedCount={candidate.submissions?.filter(s => s.review?.passed).length ?? 0} size="md" />
              </h1>
              {candidate.location && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {candidate.location}
                </p>
              )}
              <Badge
                className={`mt-2 ${availabilityColors[candidate.availability]}`}
              >
                {availabilityLabels[candidate.availability]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rates */}
      {(candidate.hourlyRate != null || candidate.monthlyRate != null) && (
        <Card>
          <CardHeader>
            <CardTitle>Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              {candidate.hourlyRate != null && (
                <div>
                  <p className="text-2xl font-bold">${candidate.hourlyRate}</p>
                  <p className="text-sm text-muted-foreground">per hour</p>
                </div>
              )}
              {candidate.monthlyRate != null && (
                <div>
                  <p className="text-2xl font-bold">${candidate.monthlyRate}</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bio */}
      {candidate.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{candidate.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {candidate.skills && candidate.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Results */}
      {candidate.submissions && candidate.submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {candidate.submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{sub.assessment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {sub.assessment.difficulty}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {sub.review ? (
                      <>
                        <span
                          className={`text-lg font-semibold ${getScoreColor(sub.review.averageScore)}`}
                        >
                          {sub.review.averageScore.toFixed(1)}
                        </span>
                        {sub.review.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Pending review</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      {(candidate.githubUrl || candidate.linkedinUrl || candidate.resumeUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {candidate.githubUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={candidate.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              )}
              {candidate.linkedinUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {candidate.resumeUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Resume
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite to Interview Dialog */}
      <Dialog
        open={inviteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setInviteOpen(false);
            setSelectedJobId(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to Interview</DialogTitle>
            <DialogDescription>
              Select a job to invite {candidate.name ?? "this candidate"} for an interview
            </DialogDescription>
          </DialogHeader>

          {isLoadingJobs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !openJobs || openJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                You have no open jobs. Create a job posting first to invite candidates.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {openJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    selectedJobId === job.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  }`}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <p className="font-medium text-sm">{job.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    )}
                    {job.employmentType && (
                      <span>{job.employmentType.replace(/_/g, " ")}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInviteOpen(false);
                setSelectedJobId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!selectedJobId || inviteMutation.isPending}
            >
              {inviteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
