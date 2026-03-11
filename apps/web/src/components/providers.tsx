"use client";

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        {children}
        <Toaster position="top-right" richColors />
      </TRPCReactProvider>
    </SessionProvider>
  );
}
