import { Redirect, Stack, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Bell } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/trpc";
import { BackButton } from "@/components/ui/BackButton";

export default function AppLayout() {
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const bgColor = isDark ? "#141414" : "#FFFFFF";
  const surfaceColor = isDark ? "#1E1E1E" : "#F5F5F5";
  const tintColor = isDark ? "#FAFAFA" : "#141414";

  const { data: unreadCount } = api.notification.unreadCount.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const notificationBell = () => (
    <Pressable
      onPress={() => router.push("/(app)/notifications")}
      hitSlop={12}
      style={{ marginRight: 16 }}
    >
      <View>
        <Bell size={22} strokeWidth={1.5} color={tintColor} />
        {(unreadCount ?? 0) > 0 && (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -6,
              backgroundColor: "#EF4444",
              borderRadius: 8,
              minWidth: 16,
              height: 16,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 4,
            }}
          />
        )}
      </View>
    </Pressable>
  );

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
          headerTitleAlign: "left",
          headerBackVisible: false,
          headerLeft: () => <BackButton color={tintColor} />,
          headerRight: notificationBell,
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
          headerTitleAlign: "left",
          headerBackVisible: false,
          headerLeft: () => <BackButton color={tintColor} />,
          headerRight: notificationBell,
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
          headerTitleAlign: "left",
          headerBackVisible: false,
          headerLeft: () => <BackButton color={tintColor} />,
          headerRight: notificationBell,
          contentStyle: { backgroundColor: surfaceColor },
        }}
      />
      <Stack.Screen name="messages" options={{ headerShown: false }} />
    </Stack>
  );
}
