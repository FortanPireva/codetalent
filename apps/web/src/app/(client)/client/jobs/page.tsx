"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Briefcase } from "lucide-react";
import { JobCard } from "./_components/JobCard";
import type { JobStatus } from "@codetalent/db";

export default function JobsListPage() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");

  const { data: jobs, isLoading } = api.job.list.useQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: search || undefined,
    sort,
  });

  const { data: stats } = api.job.getStats.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Manage your job postings
          </p>
        </div>
        <Button asChild>
          <Link href="/client/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Status tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as JobStatus | "ALL")}
      >
        <TabsList>
          <TabsTrigger value="ALL">
            All {stats ? `(${stats.totalJobs})` : ""}
          </TabsTrigger>
          <TabsTrigger value="OPEN">
            Open {stats && stats.openJobs > 0 ? `(${stats.openJobs})` : ""}
          </TabsTrigger>
          <TabsTrigger value="DRAFT">
            Draft {stats && stats.draftJobs > 0 ? `(${stats.draftJobs})` : ""}
          </TabsTrigger>
          <TabsTrigger value="PAUSED">Paused</TabsTrigger>
          <TabsTrigger value="FILLED">Filled</TabsTrigger>
          <TabsTrigger value="CLOSED">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-lg bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
          <p className="text-muted-foreground mt-1">
            {search
              ? "Try a different search term"
              : statusFilter !== "ALL"
                ? "No jobs with this status"
                : "Create your first job posting to start hiring"}
          </p>
          {!search && statusFilter === "ALL" && (
            <Button asChild className="mt-4">
              <Link href="/client/jobs/new">
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
