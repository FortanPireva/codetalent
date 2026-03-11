import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { BackButton } from "@/components/ui/BackButton";

export default function ProfileLayout() {
  const { isDark } = useTheme();
  const surfaceColor = isDark ? "#1E1E1E" : "#F5F5F5";
  const tintColor = isDark ? "#FAFAFA" : "#141414";

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? "#141414" : "#FFFFFF" },
        headerTintColor: tintColor,
        headerTitleStyle: { fontFamily: "Satoshi-Bold" },
        headerBackVisible: false,
        headerLeft: () => <BackButton color={tintColor} />,
        contentStyle: { backgroundColor: surfaceColor },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen name="edit" options={{ title: "Edit Profile" }} />
    </Stack>
  );
}
