import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const bgColor = isDark ? "#141414" : "#FFFFFF";

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
