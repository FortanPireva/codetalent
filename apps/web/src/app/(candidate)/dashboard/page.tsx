"use client";

import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDate,
  statusColors,
  statusLabels,
  difficultyColors,
  difficultyLabels,
} from "@/lib/utils";
import { Clock, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: assessments, isLoading: assessmentsLoading } =
    api.assessment.listActive.useQuery();
  const { data: submissions, isLoading: submissionsLoading } =
    api.assessment.mySubmissions.useQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          View available assessments and track your progress
        </p>
      </div>

      <Tabs defaultValue="assessments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assessments">Available Assessments</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          {assessmentsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-1/3 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : assessments?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No assessments available at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assessments?.map((assessment) => (
                <Card key={assessment.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {assessment.title}
                      </CardTitle>
                      <Badge className={difficultyColors[assessment.difficulty]}>
                        {difficultyLabels[assessment.difficulty]}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {assessment.timeLimit} days to complete
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {assessment.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/assessments/${assessment.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {submissionsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-5 w-40" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : submissions?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t applied to any assessments yet
                </p>
                <Button asChild>
                  <Link href="/dashboard">Browse Assessments</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions?.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle>{submission.assessment.title}</CardTitle>
                        <CardDescription>
                          Applied on {formatDate(submission.createdAt)}
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
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        {submission.forkUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={submission.forkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View your fork
                            </a>
                          </div>
                        )}
                        {submission.submittedAt && (
                          <p className="text-sm text-muted-foreground">
                            Submitted on {formatDate(submission.submittedAt)}
                          </p>
                        )}
                        {submission.review && (
                          <div className="flex items-center gap-2">
                            {submission.review.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              Score: {submission.review.averageScore.toFixed(2)}
                              /5.0
                            </span>
                          </div>
                        )}
                      </div>

                      {(submission.status === "ASSIGNED" ||
                        submission.status === "IN_PROGRESS") && (
                        <Button asChild>
                          <Link href={`/assessments/${submission.assessmentId}`}>
                            Continue Assessment
                          </Link>
                        </Button>
                      )}

                      {(submission.status === "PASSED" ||
                        submission.status === "REJECTED") &&
                        submission.review && (
                          <Button variant="outline" asChild>
                            <Link href={`/assessments/${submission.assessmentId}`}>
                              View Review
                            </Link>
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900">How it works</h3>
        <ol className="mt-2 text-sm text-blue-800 list-decimal list-inside space-y-1">
          <li>Choose an assessment that matches your skill level</li>
          <li>Fork the GitHub repository provided</li>
          <li>Complete the challenge within the time limit</li>
          <li>Submit your fork URL for AI-powered review</li>
          <li>Receive detailed feedback and scoring</li>
        </ol>
      </div>
    </div>
  );
}
