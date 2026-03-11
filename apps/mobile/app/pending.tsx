import { View, Text, Pressable } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingScreen() {
  const { logout } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="mb-4 text-5xl">⏳</Text>
      <Text className="mb-2 text-center font-bold text-2xl text-foreground">
        Under Review
      </Text>
      <Text className="text-center font-sans text-base text-muted-foreground leading-6">
        Your profile is under review by the Codeks team. We'll notify you once
        it's approved.
      </Text>
      <Pressable
        className="mt-6"
        onPress={() => { logout().catch(() => {}); }}
        hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
      >
        <Text className="font-sans text-sm text-placeholder">Sign Out</Text>
      </Pressable>
    </View>
  );
}
