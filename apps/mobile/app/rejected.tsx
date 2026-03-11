import { View, Text, Pressable } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function RejectedScreen() {
  const { logout } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="mb-4 text-5xl">❌</Text>
      <Text className="mb-2 text-center font-bold text-2xl text-foreground">
        Application Rejected
      </Text>
      <Text className="text-center font-sans text-base text-muted-foreground leading-6">
        Unfortunately, your application was not approved at this time. Please
        contact support if you have any questions.
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
