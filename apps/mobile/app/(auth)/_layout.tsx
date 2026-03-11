import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/jobs" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
