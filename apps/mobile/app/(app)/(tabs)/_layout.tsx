import { Tabs, useRouter } from "expo-router";
import { Text, Pressable, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/trpc";

export default function TabLayout() {
  const { isDark } = useTheme();
  const router = useRouter();
  const bgColor = isDark ? "#141414" : "#FFFFFF";
  const surfaceColor = isDark ? "#1E1E1E" : "#F5F5F5";

  const { data: unreadCount } = api.notification.unreadCount.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const { data: threads } = api.messages.listThreads.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const totalUnread = threads?.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0) ?? 0;

  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: surfaceColor }}
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#FAFAFA" : "#141414",
        tabBarInactiveTintColor: isDark ? "#707070" : "#999999",
        headerShown: true,
        headerStyle: { backgroundColor: bgColor },
        headerTintColor: isDark ? "#FAFAFA" : "#141414",
        headerTitleStyle: { fontFamily: "Satoshi-Bold" },
        headerRight: () => (
          <Pressable
            onPress={() => router.push("/(app)/notifications")}
            className="mr-4"
          >
            <View>
              <Text style={{ fontSize: 20, color: isDark ? "#FAFAFA" : "#141414" }}>
                🔔
              </Text>
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
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 10, fontFamily: "Satoshi-Bold" }}>
                    {unreadCount! > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        ),
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2A2A2A" : "#EEEEEE",
          backgroundColor: bgColor,
        },
        tabBarLabelStyle: { fontFamily: "Satoshi-Medium" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💼</Text>,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: "Applications",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <View>
              <Text style={{ color, fontSize: 20 }}>💬</Text>
              {totalUnread > 0 && (
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
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 10, fontFamily: "Satoshi-Bold" }}>
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
