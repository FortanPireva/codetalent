"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { formatDate, companySizeLabels, companySizeColors } from "@/lib/utils";
import { Search, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ClientVerificationPage() {
  const [search, setSearch] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectUserId, setRejectUserId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const utils = api.useUtils();

  const { data: clients, isLoading } =
    api.clients.listPendingClientVerification.useQuery({
      search: search || undefined,
    });

  const approveMutation = api.clients.approveClient.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name ?? "Client"} has been approved`);
      utils.clients.listPendingClientVerification.invalidate();
      utils.clients.pendingClientCount.invalidate();
      utils.clients.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectMutation = api.clients.rejectClient.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name ?? "Client"} has been rejected`);
      setRejectDialogOpen(false);
      setRejectUserId(null);
      setRejectReason("");
      utils.clients.listPendingClientVerification.invalidate();
      utils.clients.pendingClientCount.invalidate();
      utils.clients.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const openRejectDialog = (userId: string) => {
    setRejectUserId(userId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = () => {
    if (!rejectUserId) return;
    rejectMutation.mutate({
      userId: rejectUserId,
      reason: rejectReason || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Client Verification
        </h1>
        <p className="text-muted-foreground">
          Review and verify new client company registrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name, contact name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Clients</CardTitle>
          <CardDescription>
            {clients?.length ?? 0} client(s) awaiting verification
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
          ) : clients?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No clients pending verification
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients?.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <p className="font-medium">{client.name}</p>
                        {client.website && (
                          <a
                            href={client.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{client.contactName}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.contactEmail}
                        </p>
                      </TableCell>
                      <TableCell>{client.industry}</TableCell>
                      <TableCell>
                        <Badge className={companySizeColors[client.size]}>
                          {companySizeLabels[client.size]}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.location}</TableCell>
                      <TableCell>
                        {client.user?.createdAt
                          ? formatDate(client.user.createdAt)
                          : formatDate(client.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {client.user && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() =>
                                approveMutation.mutate({
                                  userId: client.user!.id,
                                })
                              }
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() =>
                                openRejectDialog(client.user!.id)
                              }
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Client</DialogTitle>
            <DialogDescription>
              Optionally provide a reason for rejection. This will be visible to
              the client.
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
              {rejectMutation.isPending ? "Rejecting..." : "Reject Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
