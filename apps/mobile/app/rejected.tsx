import { View, Text, Pressable } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function RejectedScreen() {
  const { logout } = useAuth();
  const c = useThemeColors();

  return (
    <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: c.bg }}>
      <Text className="mb-4 text-5xl">❌</Text>
      <Text className="mb-2 text-center font-bold text-2xl" style={{ color: c.fg }}>
        Application Rejected
      </Text>
      <Text className="text-center font-sans text-base leading-6" style={{ color: c.mutedFg }}>
        Unfortunately, your application was not approved at this time. Please
        contact support if you have any questions.
      </Text>
      <Pressable
        className="mt-6"
        onPress={() => { logout().catch(() => {}); }}
        hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
      >
        <Text className="font-sans text-sm" style={{ color: c.placeholder }}>Sign Out</Text>
      </Pressable>
    </View>
  );
}
