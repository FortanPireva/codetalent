import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { BackButton } from "@/components/ui/BackButton";

export default function AppLayout() {
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();
  const bgColor = isDark ? "#141414" : "#FFFFFF";
  const surfaceColor = isDark ? "#1E1E1E" : "#F5F5F5";
  const tintColor = isDark ? "#FAFAFA" : "#141414";

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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: bgColor },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen
        name="jobs/[id]"
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: bgColor },
          headerTintColor: tintColor,
          headerTitleStyle: { fontFamily: "Satoshi-Bold" },
          headerBackVisible: false,
          headerLeft: () => <BackButton color={tintColor} />,
          contentStyle: { backgroundColor: surfaceColor },
        }}
      />
      <Stack.Screen
        name="applications/[id]"
        options={{
          headerShown: true,
          title: "Application",
          headerStyle: { backgroundColor: bgColor },
          headerTintColor: tintColor,
          headerTitleStyle: { fontFamily: "Satoshi-Bold" },
          headerBackVisible: false,
          headerLeft: () => <BackButton color={tintColor} />,
          contentStyle: { backgroundColor: surfaceColor },
        }}
      />
      <Stack.Screen
        name="assessments/[id]"
        options={{
          headerShown: true,
          title: "Assessment",
          headerStyle: { backgroundColor: bgColor },
          headerTintColor: tintColor,
          headerTitleStyle: { fontFamily: "Satoshi-Bold" },
          headerBackVisible: false,
          headerLeft: () => <BackButton color={tintColor} />,
          contentStyle: { backgroundColor: surfaceColor },
        }}
      />
      <Stack.Screen name="messages" options={{ headerShown: false }} />
    </Stack>
  );
}
