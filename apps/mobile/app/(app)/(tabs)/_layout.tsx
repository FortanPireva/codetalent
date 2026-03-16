import { Tabs } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/trpc";
import { Home, Briefcase, ClipboardList, MessageCircle, User } from "lucide-react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FloatingTabBar } from "@/components/ui/FloatingTabBar";

export default function TabLayout() {
  const { isDark } = useTheme();
  const surfaceColor = isDark ? "#1E1E1E" : "#F5F5F5";

  const { data: threads } = api.messages.listThreads.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const totalUnread = threads?.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0) ?? 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Tabs
          tabBar={(props) => <FloatingTabBar {...props} />}
          sceneContainerStyle={{ backgroundColor: surfaceColor }}
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => <Home size={22} strokeWidth={1.5} color={color} />,
            }}
          />
          <Tabs.Screen
            name="jobs"
            options={{
              title: "Jobs",
              tabBarIcon: ({ color }) => <Briefcase size={22} strokeWidth={1.5} color={color} />,
            }}
          />
          <Tabs.Screen
            name="applications"
            options={{
              title: "Applications",
              tabBarIcon: ({ color }) => <ClipboardList size={22} strokeWidth={1.5} color={color} />,
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: "Messages",
              tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
              tabBarIcon: ({ color }) => (
                <MessageCircle size={22} strokeWidth={1.5} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color }) => <User size={22} strokeWidth={1.5} color={color} />,
            }}
          />
        </Tabs>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
