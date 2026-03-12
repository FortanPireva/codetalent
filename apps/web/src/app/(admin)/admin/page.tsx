"use client";

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
import {
  formatDate,
  statusColors,
  statusLabels,
  difficultyColors,
  difficultyLabels,
} from "@/lib/utils";
import { Users, FileCode, CheckCircle, Clock, ArrowRight, UserPlus, Building2, Building, Briefcase } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats } = api.talentPool.stats.useQuery();
  const { data: submissionsData } = api.assessment.listSubmissions.useQuery({});
  const { data: assessments } = api.assessment.listAll.useQuery();
  const { data: clientStats } = api.clients.stats.useQuery();
  const { data: pendingClientCount } = api.clients.pendingClientCount.useQuery();
  const { data: jobStats } = api.job.adminStats.useQuery();

  const submissions = submissionsData?.items;
  const recentSubmissions = submissions?.slice(0, 5);
  const pendingReviews = submissions?.filter((s) => s.status === "SUBMITTED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your hiring pipeline
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCandidates ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activelyLooking ?? 0} actively looking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Assessments
            </CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessments?.filter((a) => a.isActive).length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {assessments?.length ?? 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Passed Assessments
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.passedAssessments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              candidates in talent pool
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingReviews?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              awaiting AI review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Verification
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingVerification ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              new candidates to review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientStats?.activeClients ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {clientStats?.leads ?? 0} leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Clients
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingClientCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Jobs
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobStats?.totalJobs ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {jobStats?.openJobs ?? 0} open
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>
                  Latest candidate submissions
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/candidates">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentSubmissions?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No submissions yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentSubmissions?.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {submission.user.name ?? submission.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {submission.assessment.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={difficultyColors[submission.assessment.difficulty]}
                        variant="outline"
                      >
                        {difficultyLabels[submission.assessment.difficulty]}
                      </Badge>
                      <Badge className={statusColors[submission.status]}>
                        {statusLabels[submission.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending reviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Reviews</CardTitle>
                <CardDescription>
                  Submissions awaiting AI review
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pendingReviews?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending reviews
              </p>
            ) : (
              <div className="space-y-4">
                {pendingReviews?.slice(0, 5).map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {submission.user.name ?? submission.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {submission.assessment.title} &middot;{" "}
                        {formatDate(submission.submittedAt!)}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/admin/candidates/${submission.id}`}>
                        Review
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/admin/assessments/new">Create Assessment</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/candidates">View Pipeline</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/verification">Review Pending Candidates</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/talent-pool">Browse Talent Pool</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/client-verification">Review Pending Clients</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/clients">Manage Clients</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/jobs">Manage Jobs</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
