import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function AppLayout() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.candidateStatus === "ONBOARDING") {
    return <Redirect href="/onboarding" />;
  }
  if (user?.candidateStatus === "PENDING_REVIEW") {
    return <Redirect href="/pending" />;
  }
  if (user?.candidateStatus === "REJECTED") {
    return <Redirect href="/rejected" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
