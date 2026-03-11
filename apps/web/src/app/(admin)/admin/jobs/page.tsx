"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  formatDate,
  jobStatusColors,
  jobStatusLabels,
  employmentTypeLabels,
  workArrangementLabels,
} from "@/lib/utils";
import { JobStatus } from "@codetalent/db";
import { Search, Trash2, ExternalLink } from "lucide-react";

export default function AdminJobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">("ALL");
  const [clientFilter, setClientFilter] = useState<string>("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: jobs, isLoading, refetch } = api.job.adminList.useQuery({
    search: search || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    clientId: clientFilter === "ALL" ? undefined : clientFilter,
  });

  const deleteMutation = api.job.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Job deleted");
      setDeleteId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Derive unique clients from the loaded jobs for the client filter
  const clientOptions = jobs
    ? Array.from(
        new Map(jobs.map((j) => [j.client.id, j.client.name])).entries()
      ).sort((a, b) => a[1].localeCompare(b[1]))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground">
          Manage job postings across all clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as JobStatus | "ALL")}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {Object.entries(jobStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={clientFilter}
              onValueChange={(v) => setClientFilter(v)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Clients</SelectItem>
                {clientOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Postings</CardTitle>
          <CardDescription>
            {jobs?.length ?? 0} job(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : jobs?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No jobs found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Role Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Employment</TableHead>
                    <TableHead>Work Arrangement</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs?.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="hover:underline"
                        >
                          <p className="font-medium">{job.title}</p>
                          {job.summary && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {job.summary}
                            </p>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/clients/${job.client.id}`}
                          className="text-sm hover:underline"
                        >
                          {job.client.name}
                        </Link>
                      </TableCell>
                      <TableCell>{job.roleType ?? "—"}</TableCell>
                      <TableCell>
                        <Badge className={jobStatusColors[job.status]}>
                          {jobStatusLabels[job.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.employmentType
                          ? employmentTypeLabels[job.employmentType]
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {job.workArrangement
                          ? workArrangementLabels[job.workArrangement]
                          : "—"}
                      </TableCell>
                      <TableCell>{formatDate(job.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/jobs/${job.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteId(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
