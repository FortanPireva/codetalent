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

export default function ClientRejectedPage() {
  const { data: status } = api.clientOnboarding.getStatus.useQuery();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Application Not Approved</CardTitle>
          <CardDescription className="text-base mt-2">
            Unfortunately, your company application has not been approved at this
            time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status?.clientRejectionReason && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Reason:</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {status.clientRejectionReason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
