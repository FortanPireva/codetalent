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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatDate, difficultyColors, difficultyLabels } from "@/lib/utils";
import { Plus, ExternalLink, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AssessmentsPage() {
  const { data: assessments, isLoading, refetch } =
    api.assessment.listAll.useQuery();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = api.assessment.delete.useMutation({
    onSuccess: () => {
      toast.success("Assessment deleted");
      setDeleteId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleActiveMutation = api.assessment.update.useMutation({
    onSuccess: () => {
      toast.success("Assessment updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">
            Manage technical assessments
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/assessments/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
          <CardDescription>
            {assessments?.length ?? 0} assessment(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted rounded animate-pulse"
                />
              ))}
            </div>
          ) : assessments?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No assessments created yet
              </p>
              <Button asChild>
                <Link href="/admin/assessments/new">Create First Assessment</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Time Limit</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments?.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assessment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            /{assessment.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={difficultyColors[assessment.difficulty]}>
                          {difficultyLabels[assessment.difficulty]}
                        </Badge>
                      </TableCell>
                      <TableCell>{assessment.timeLimit} days</TableCell>
                      <TableCell>{assessment._count.submissions}</TableCell>
                      <TableCell>
                        <Badge
                          variant={assessment.isActive ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() =>
                            handleToggleActive(assessment.id, assessment.isActive)
                          }
                        >
                          {assessment.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(assessment.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={assessment.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Dialog
                            open={deleteId === assessment.id}
                            onOpenChange={(open) =>
                              setDeleteId(open ? assessment.id : null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Assessment</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete &quot;
                                  {assessment.title}&quot;? This will also delete
                                  all related submissions and reviews. This action
                                  cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setDeleteId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleDelete}
                                  disabled={deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending
                                    ? "Deleting..."
                                    : "Delete"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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
    </div>
  );
}
