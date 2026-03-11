"use client";

import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  PAST_DUE: "outline",
  CANCELLED: "destructive",
  EXPIRED: "secondary",
};

export default function AdminSubscriptionsPage() {
  const { data: subscriptions, isLoading } =
    api.subscription.listAll.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">
          Overview of all client subscriptions
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !subscriptions?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          No subscriptions yet
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-bold uppercase tracking-widest">
                  Client
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-widest">
                  Tier
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-widest">
                  Status
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-widest">
                  Billing
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-widest">
                  Period Ends
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-widest text-right">
                  Days Left
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {sub.client.name}
                  </TableCell>
                  <TableCell>{sub.tier}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariant[sub.status] ?? "secondary"}
                      className="rounded-md text-[10px] font-bold uppercase tracking-wide"
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sub.billingInterval === "YEARLY" ? "Yearly" : "Monthly"}
                  </TableCell>
                  <TableCell>
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {sub.daysRemaining}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
