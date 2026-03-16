import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { api } from "@/lib/trpc";
import { useThemeColors } from "@/hooks/useThemeColors";

export function ScreenHeader() {
  const router = useRouter();
  const c = useThemeColors();

  const { data: unreadCount } = api.notification.unreadCount.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: c.surface }}
    >
      <View
        className="flex-row items-end justify-end px-4 pb-2 pt-1"
      >
        <Pressable
          onPress={() => router.push("/(app)/notifications")}
          hitSlop={12}
        >
          <View>
            <Bell size={22} strokeWidth={1.5} color={c.fg} />
            {(unreadCount ?? 0) > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -6,
                  backgroundColor: "#EF4444",
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 4,
                }}
              />
            )}
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
