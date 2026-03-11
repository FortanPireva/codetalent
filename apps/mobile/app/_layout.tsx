import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api, createMobileTRPCClient } from "@/lib/trpc";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => createMobileTRPCClient());

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </AuthProvider>
      </QueryClientProvider>
    </api.Provider>
  );
}
