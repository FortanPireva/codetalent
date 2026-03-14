"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  formatDate,
  formatDateTime,
  statusColors,
  statusLabels,
  difficultyColors,
  difficultyLabels,
  getScoreColor,
  getPassThreshold,
} from "@/lib/utils";
import { SubmissionStatus } from "@codetalent/db";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Linkedin,
  Bot,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function SubmissionDetailPage() {
  const params = useParams();
  const submissionId = params.id as string;

  const { data: submission, isLoading, refetch } =
    api.assessment.getSubmission.useQuery(
      { id: submissionId },
      { enabled: !!submissionId }
    );

  const runReviewMutation = api.review.runReview.useMutation({
    onSuccess: () => {
      toast.success("Review completed successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateStatusMutation = api.assessment.updateSubmissionStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRunReview = () => {
    runReviewMutation.mutate({ submissionId });
  };

  const handleStatusChange = (status: SubmissionStatus) => {
    updateStatusMutation.mutate({ id: submissionId, status });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Submission not found</p>
          <Button asChild>
            <Link href="/admin/candidates">Back to Pipeline</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/admin/candidates">
          <ArrowLeft className="h-4 w-4" />
          Back to Pipeline
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main submission info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{submission.assessment.title}</CardTitle>
                  <CardDescription>
                    Submitted by {submission.user.name ?? submission.user.email}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      difficultyColors[submission.assessment.difficulty]
                    }
                  >
                    {difficultyLabels[submission.assessment.difficulty]}
                  </Badge>
                  <Badge className={statusColors[submission.status]}>
                    {statusLabels[submission.status]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-medium">
                    {submission.startedAt
                      ? formatDateTime(submission.startedAt)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {submission.submittedAt
                      ? formatDateTime(submission.submittedAt)
                      : "-"}
                  </p>
                </div>
              </div>

              {submission.forkUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Fork Repository
                  </p>
                  <a
                    href={submission.forkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    {submission.forkUrl}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <Separator />

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    Update Status
                  </p>
                  <Select
                    value={submission.status}
                    onValueChange={(v) =>
                      handleStatusChange(v as SubmissionStatus)
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {submission.status === "SUBMITTED" && !submission.review && (
                  <Button
                    onClick={handleRunReview}
                    disabled={runReviewMutation.isPending}
                    className="gap-2"
                  >
                    <Bot className="h-4 w-4" />
                    {runReviewMutation.isPending
                      ? "Running AI Review..."
                      : "Run AI Review"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Results */}
          {submission.review && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {submission.review.passed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                    AI Review Results
                  </CardTitle>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Average Score
                    </p>
                    <p
                      className={`text-2xl font-bold ${getScoreColor(
                        submission.review.averageScore
                      )}`}
                    >
                      {submission.review.averageScore.toFixed(2)}/5.0
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pass threshold:{" "}
                      {getPassThreshold(submission.assessment.difficulty).toFixed(
                        1
                      )}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-muted-foreground">
                    {submission.review.summary}
                  </p>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                      Strengths
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {submission.review.strengths.map((s, i) => (
                        <li key={i} className="text-muted-foreground">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-400">
                      Areas for Improvement
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {submission.review.improvements.map((s, i) => (
                        <li key={i} className="text-muted-foreground">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Detailed Scores</h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: "Code Quality",
                        value: submission.review.codeQuality,
                      },
                      {
                        label: "Architecture",
                        value: submission.review.architecture,
                      },
                      {
                        label: "Type Safety",
                        value: submission.review.typeSafety,
                      },
                      {
                        label: "Error Handling",
                        value: submission.review.errorHandling,
                      },
                      { label: "Testing", value: submission.review.testing },
                      {
                        label: "Git Practices",
                        value: submission.review.gitPractices,
                      },
                      {
                        label: "Documentation",
                        value: submission.review.documentation,
                      },
                      {
                        label: "Best Practices",
                        value: submission.review.bestPractices,
                      },
                    ].map((score) => (
                      <div key={score.label} className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">
                          {score.label}
                        </p>
                        <p
                          className={`text-lg font-semibold ${getScoreColor(
                            score.value
                          )}`}
                        >
                          {score.value.toFixed(1)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Candidate info sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">
                  {submission.user.name ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{submission.user.email}</p>
              </div>
              {submission.user.skills && submission.user.skills.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {submission.user.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                {submission.user.githubUrl && (
                  <a
                    href={submission.user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    GitHub Profile
                  </a>
                )}
                {submission.user.linkedinUrl && (
                  <a
                    href={submission.user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{submission.assessment.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <Badge
                  className={
                    difficultyColors[submission.assessment.difficulty]
                  }
                >
                  {difficultyLabels[submission.assessment.difficulty]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Limit</p>
                <p className="font-medium">
                  {submission.assessment.timeLimit} days
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Starter Repo
                </p>
                <a
                  href={submission.assessment.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View Repository
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
