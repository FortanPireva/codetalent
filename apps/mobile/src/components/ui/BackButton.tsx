import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";

interface BackButtonProps {
  color?: string;
}

export function BackButton({ color }: BackButtonProps) {
  const router = useRouter();
  const c = useThemeColors();
  const tintColor = color ?? c.fg;

  return (
    <Pressable onPress={() => router.back()} hitSlop={8}>
      <Text style={{ color: tintColor, fontSize: 28, marginRight: 8 }}>‹</Text>
    </Pressable>
  );
}
