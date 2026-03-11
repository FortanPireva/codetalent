import { Tabs } from "expo-router";
import { Text, useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#FAFAFA" : "#141414",
        tabBarInactiveTintColor: isDark ? "#707070" : "#999999",
        headerShown: true,
        headerStyle: { backgroundColor: isDark ? "#141414" : "#FFFFFF" },
        headerTintColor: isDark ? "#FAFAFA" : "#141414",
        headerTitleStyle: { fontFamily: "Satoshi-Bold" },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2A2A2A" : "#EEEEEE",
          backgroundColor: isDark ? "#141414" : "#FFFFFF",
        },
        tabBarLabelStyle: { fontFamily: "Satoshi-Medium" },
      }}
    >
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
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
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
