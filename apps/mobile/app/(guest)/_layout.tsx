import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function GuestLayout() {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const bgColor = isDark ? "#141414" : "#FFFFFF";

  // Authenticated users should go through the normal app flow
  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/jobs" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: bgColor },
      }}
    />
  );
}
