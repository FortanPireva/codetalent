"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatDate,
  availabilityLabels,
  availabilityColors,
  candidateStatusLabels,
  candidateStatusColors,
} from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Github,
  Linkedin,
  ExternalLink,
  Phone,
  MapPin,
  Mail,
  FileText,
  Calendar,
} from "lucide-react";

export default function VerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const utils = api.useUtils();

  const { data: candidate, isLoading } =
    api.talentPool.getPendingCandidate.useQuery(
      { id: candidateId },
      { enabled: !!candidateId }
    );

  const approveMutation = api.talentPool.approveCandidate.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name ?? "Candidate"} has been approved`);
      utils.talentPool.listPendingVerification.invalidate();
      utils.talentPool.stats.invalidate();
      router.push("/admin/verification");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectMutation = api.talentPool.rejectCandidate.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name ?? "Candidate"} has been rejected`);
      setRejectDialogOpen(false);
      utils.talentPool.listPendingVerification.invalidate();
      utils.talentPool.stats.invalidate();
      router.push("/admin/verification");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleReject = () => {
    rejectMutation.mutate({
      userId: candidateId,
      reason: rejectReason || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!candidate) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Candidate not found</p>
          <Button asChild>
            <Link href="/admin/verification">Back to Verification</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/admin/verification">
          <ArrowLeft className="h-4 w-4" />
          Back to Verification
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main candidate info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {candidate.name ?? "Unknown"}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {candidate.email}
                  </p>
                </div>
                <Badge className={candidateStatusColors[candidate.candidateStatus]}>
                  {candidateStatusLabels[candidate.candidateStatus]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {candidate.bio && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Bio
                  </h4>
                  <p>{candidate.bio}</p>
                </div>
              )}

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                {candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{candidate.phone}</p>
                    </div>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{candidate.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{candidate.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{formatDate(candidate.createdAt)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Availability
                </h4>
                <Badge className={availabilityColors[candidate.availability]}>
                  {availabilityLabels[candidate.availability]}
                </Badge>
              </div>

              {candidate.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action buttons */}
          {candidate.candidateStatus === "PENDING_REVIEW" && (
            <Card>
              <CardContent className="flex items-center justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    setRejectReason("");
                    setRejectDialogOpen(true);
                  }}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() =>
                    approveMutation.mutate({ userId: candidateId })
                  }
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {approveMutation.isPending ? "Approving..." : "Approve Candidate"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar with links */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.githubUrl && (
                <a
                  href={candidate.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Github className="h-4 w-4" />
                  GitHub Profile
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
              {candidate.linkedinUrl && (
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  View Resume
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
              {!candidate.githubUrl &&
                !candidate.linkedinUrl &&
                !candidate.resumeUrl && (
                  <p className="text-sm text-muted-foreground">
                    No links provided
                  </p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
            <DialogDescription>
              Optionally provide a reason for rejection. This will be visible to
              the candidate.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Candidate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
