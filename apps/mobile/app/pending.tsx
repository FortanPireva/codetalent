import { View, Text, Pressable } from "react-native";
import { Clock } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function PendingScreen() {
  const { logout } = useAuth();
  const c = useThemeColors();

  return (
    <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: c.bg }}>
      <View className="mb-4 items-center justify-center rounded-2xl p-4" style={{ backgroundColor: c.highlightBg }}>
        <Clock size={40} strokeWidth={1.5} color={c.highlight} />
      </View>
      <Text className="mb-2 text-center font-bold text-2xl" style={{ color: c.fg }}>
        Under Review
      </Text>
      <Text className="text-center font-sans text-base leading-6" style={{ color: c.mutedFg }}>
        Your profile is under review by the Codeks team. We'll notify you once
        it's approved.
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
