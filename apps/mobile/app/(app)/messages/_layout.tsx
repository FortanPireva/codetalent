import { Stack } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { BackButton } from "@/components/ui/BackButton";

export default function MessagesLayout() {
  const c = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.fg,
        headerTitleStyle: { fontFamily: "Satoshi-Bold" },
        headerTitleAlign: "left",
        contentStyle: { backgroundColor: c.surface },
      }}
    >
      <Stack.Screen
        name="[threadId]"
        options={{
          title: "Conversation",
          headerBackVisible: false,
          headerLeft: () => <BackButton color={c.fg} />,
        }}
      />
    </Stack>
  );
}
