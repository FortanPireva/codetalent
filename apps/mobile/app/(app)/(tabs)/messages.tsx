import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MessageCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/trpc";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { timeAgo } from "@/lib/timeAgo";

export default function MessagesScreen() {
  const router = useRouter();
  const c = useThemeColors();

  const {
    data: threads,
    isLoading,
    refetch,
    isRefetching,
  } = api.messages.listThreads.useQuery(undefined, {
    refetchInterval: 10_000,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.surface }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: c.surface }}>
    <ScreenHeader />
    <FlatList
      className="flex-1"
      contentContainerStyle={
        (threads ?? []).length === 0
          ? { flex: 1, justifyContent: "center", alignItems: "center" }
          : { padding: 16, paddingBottom: 100 }
      }
      data={threads ?? []}
      keyExtractor={(item) => item.threadId}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={
        <View className="items-center p-8">
          <View style={{ marginBottom: 12 }}>
            <MessageCircle size={40} strokeWidth={1.5} color={c.placeholder} />
          </View>
          <Text className="font-sans text-base" style={{ color: c.placeholder }}>
            No conversations yet
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const name = item.client?.name ?? "Unknown";
        const preview = item.lastMessage?.body
          ? item.lastMessage.body.length > 80
            ? item.lastMessage.body.slice(0, 80) + "…"
            : item.lastMessage.body
          : "No messages yet";
        const timestamp = item.lastMessage?.sentAt ?? item.updatedAt;
        const hasUnread = (item.unreadCount ?? 0) > 0;

        return (
          <Pressable
            className="mb-2 flex-row items-center rounded-xl p-3"
            style={{ backgroundColor: c.card }}
            onPress={() => router.push(`/(app)/messages/${item.threadId}`)}
          >
            {/* Avatar */}
            <View
              className="mr-3 h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: c.primary }}
            >
              <Text className="font-bold text-lg" style={{ color: c.primaryFg }}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Content */}
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text
                  className="flex-1 font-bold text-sm"
                  style={{ color: c.fg }}
                  numberOfLines={1}
                >
                  {name}
                </Text>
                <Text className="ml-2 font-sans text-xs" style={{ color: c.mutedFg }}>
                  {timeAgo(timestamp)}
                </Text>
              </View>
              <View className="mt-0.5 flex-row items-center">
                <Text
                  className="flex-1 font-sans text-sm"
                  style={{ color: c.mutedFg }}
                  numberOfLines={1}
                >
                  {preview}
                </Text>
                {hasUnread && (
                  <View
                    className="ml-2 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: "#3b82f6" }}
                  />
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
    />
    </View>
  );
}
