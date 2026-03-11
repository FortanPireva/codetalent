import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Route by candidate status
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
