"use client";

import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function RejectedPage() {
  const { data: status } = api.onboarding.getStatus.useQuery();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-chip flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Application Not Approved</CardTitle>
          <CardDescription className="text-base mt-2">
            Unfortunately, your application has not been approved at this time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status?.rejectionReason && (
            <div className="bg-chip border border-border rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-chip-foreground">Reason:</p>
              <p className="text-sm text-muted-foreground mt-1">{status.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
