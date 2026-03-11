"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function ClientPendingPage() {
  const router = useRouter();
  const { update } = useSession();

  const { data: status } = api.clientOnboarding.getStatus.useQuery(undefined, {
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (status?.clientStatus === "APPROVED") {
      update().then(() => router.push("/client/dashboard"));
    }
    if (status?.clientStatus === "REJECTED") {
      update().then(() => router.push("/client/rejected"));
    }
  }, [status?.clientStatus, update, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Company Profile Under Review</CardTitle>
          <CardDescription className="text-base mt-2">
            Your company profile has been submitted and is being reviewed by our
            team. We&apos;ll notify you once a decision has been made.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will automatically update when your status changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
