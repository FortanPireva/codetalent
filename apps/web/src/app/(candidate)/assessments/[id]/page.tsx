"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  formatDate,
  statusColors,
  statusLabels,
  difficultyColors,
  difficultyLabels,
  getScoreColor,
  getPassThreshold,
} from "@/lib/utils";
import {
  Clock,
  ExternalLink,
  GitBranch,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;
  const [forkUrl, setForkUrl] = useState("");

  const { data: assessment, isLoading, refetch } = api.assessment.getById.useQuery(
    { id: assessmentId },
    { enabled: !!assessmentId }
  );

  const { data: submissions } = api.assessment.mySubmissions.useQuery();
  const submission = submissions?.find((s) => s.assessmentId === assessmentId);

  const { data: review } = api.review.getBySubmission.useQuery(
    { submissionId: submission?.id ?? "" },
    { enabled: !!submission?.id && (submission?.status === "PASSED" || submission?.status === "REJECTED") }
  );

  const applyMutation = api.assessment.apply.useMutation({
    onSuccess: () => {
      toast.success("Successfully applied to assessment!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const submitMutation = api.assessment.submitFork.useMutation({
    onSuccess: () => {
      toast.success("Fork submitted for review!");
      setForkUrl("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleApply = () => {
    applyMutation.mutate({ assessmentId });
  };

  const handleSubmitFork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission?.id || !forkUrl) return;
    submitMutation.mutate({ submissionId: submission.id, forkUrl });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/4 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessment) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Assessment not found</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{assessment.title}</CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {assessment.timeLimit} days
                </span>
              </CardDescription>
            </div>
            <Badge className={difficultyColors[assessment.difficulty]}>
              {difficultyLabels[assessment.difficulty]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {assessment.description}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Starter Repository</h3>
            <a
              href={assessment.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <GitBranch className="h-4 w-4" />
              {assessment.repoUrl}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Instructions</h4>
            <ol className="text-sm text-blue-800 dark:text-blue-300 list-decimal list-inside space-y-1">
              <li>Fork the repository above to your GitHub account</li>
              <li>Complete the challenge as described</li>
              <li>Push your changes to your fork</li>
              <li>Submit your fork URL below</li>
              <li>Wait for AI-powered code review</li>
            </ol>
            <p className="mt-2 text-sm text-blue-800 dark:text-blue-300">
              <strong>Pass threshold:</strong>{" "}
              {getPassThreshold(assessment.difficulty).toFixed(1)}/5.0 average
              score
            </p>
          </div>
        </CardContent>
        <CardFooter>
          {!submission ? (
            <Button
              onClick={handleApply}
              disabled={applyMutation.isPending}
              className="w-full sm:w-auto"
            >
              {applyMutation.isPending ? "Applying..." : "Apply to Assessment"}
            </Button>
          ) : (
            <Badge className={statusColors[submission.status]}>
              {statusLabels[submission.status]}
            </Badge>
          )}
        </CardFooter>
      </Card>

      {submission && (
        <>
          {(submission.status === "ASSIGNED" ||
            submission.status === "IN_PROGRESS") && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Solution</CardTitle>
                <CardDescription>
                  Enter the URL of your forked repository
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmitFork}>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="forkUrl">Fork URL</Label>
                    <Input
                      id="forkUrl"
                      type="url"
                      placeholder="https://github.com/yourusername/repo-name"
                      value={forkUrl}
                      onChange={(e) => setForkUrl(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Make sure your repository is public and contains your
                      completed solution
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={!forkUrl || submitMutation.isPending}
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Fork"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {(submission.status === "SUBMITTED" ||
            submission.status === "UNDER_REVIEW") && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
                <p className="font-semibold">
                  {submission.status === "SUBMITTED"
                    ? "Waiting for review..."
                    : "Review in progress..."}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your submission is being processed. This may take a few minutes.
                </p>
                {submission.forkUrl && (
                  <a
                    href={submission.forkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline mt-4"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View your submission
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {(submission.status === "PASSED" || submission.status === "REJECTED") &&
            review && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {review.passed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                      Review Results
                    </CardTitle>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Average Score
                      </p>
                      <p
                        className={`text-2xl font-bold ${getScoreColor(
                          review.averageScore
                        )}`}
                      >
                        {review.averageScore.toFixed(2)}/5.0
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <p className="text-muted-foreground">{review.summary}</p>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                        Strengths
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {review.strengths.map((s, i) => (
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
                        {review.improvements.map((s, i) => (
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
                        { label: "Code Quality", value: review.codeQuality },
                        { label: "Architecture", value: review.architecture },
                        { label: "Type Safety", value: review.typeSafety },
                        { label: "Error Handling", value: review.errorHandling },
                        { label: "Testing", value: review.testing },
                        { label: "Git Practices", value: review.gitPractices },
                        { label: "Documentation", value: review.documentation },
                        { label: "Best Practices", value: review.bestPractices },
                      ].map((score) => (
                        <div
                          key={score.label}
                          className="bg-background rounded-lg p-3"
                        >
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
        </>
      )}
    </div>
  );
}
