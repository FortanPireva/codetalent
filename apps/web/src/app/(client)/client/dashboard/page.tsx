"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Briefcase,
  FileEdit,
  Plus,
  ArrowRight,
  Globe,
  MapPin,
  Users,
  Settings,
} from "lucide-react";
import {
  jobStatusLabels,
  jobStatusColors,
  formatDate,
  companySizeLabels,
} from "@/lib/utils";

export default function ClientDashboardPage() {
  const { data: session } = useSession();
  const { data: status } = api.clientOnboarding.getStatus.useQuery();
  const { data: jobStats } = api.job.getStats.useQuery();
  const { data: recentJobs } = api.job.list.useQuery({ limit: 3 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name ?? "Client"}
        </p>
      </div>

      {/* Company info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {status?.client?.logo ? (
                <img
                  src={status.client.logo}
                  alt={status.client.name}
                  className="w-16 h-16 rounded-lg object-contain border bg-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-xl">
                  {status?.client?.name ?? "Your Company"}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span>{status?.client?.industry}</span>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {status?.client?.location}
                  </span>
                  {status?.client?.size && (
                    <>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {companySizeLabels[status.client.size]}
                      </span>
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/client/settings">
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.client?.description && (
            <p className="text-sm text-muted-foreground">
              {status.client.description}
            </p>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {status?.client?.website && (
              <a
                href={status.client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                {status.client.website}
              </a>
            )}
            {status?.client?.contactName && (
              <span className="text-muted-foreground">
                Contact: {status.client.contactName}
              </span>
            )}
            {status?.client?.contactEmail && (
              <span className="text-muted-foreground">
                {status.client.contactEmail}
              </span>
            )}
          </div>
          {status?.client?.techStack && status.client.techStack.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {status.client.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job stats */}
      {jobStats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobStats.openJobs}</p>
                  <p className="text-xs text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileEdit className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobStats.draftJobs}</p>
                  <p className="text-xs text-muted-foreground">Draft Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobStats.filledJobs}</p>
                  <p className="text-xs text-muted-foreground">Filled Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobStats.totalJobs}</p>
                  <p className="text-xs text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/client/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/client/jobs">
            View All Jobs
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Recent jobs */}
      {recentJobs && recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Your latest job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
                >
                  <div className="space-y-1">
                    <Link
                      href={`/client/jobs/${job.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {job.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {job.roleType && `${job.roleType} · `}
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <Badge className={jobStatusColors[job.status]}>
                    {jobStatusLabels[job.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
