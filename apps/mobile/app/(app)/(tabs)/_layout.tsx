import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#999",
        headerShown: true,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#eee",
        },
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
