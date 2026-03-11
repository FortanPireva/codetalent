import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { isDark } = useTheme();
  const bgColor = isDark ? "#141414" : "#FFFFFF";
  const surfaceColor = isDark ? "#1E1E1E" : "#F5F5F5";

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
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2A2A2A" : "#EEEEEE",
          backgroundColor: bgColor,
        },
        tabBarLabelStyle: { fontFamily: "Satoshi-Medium" },
      }}
    >
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
        name="assessments"
        options={{
          title: "Assessments",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
