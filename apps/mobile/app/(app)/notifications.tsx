import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { api } from "@/lib/trpc";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function NotificationsScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const utils = api.useUtils();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.notification.list.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const markAsRead = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const markAllAsRead = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const notifications = data?.pages.flatMap((p) => p.items) ?? [];

  function handlePress(item: (typeof notifications)[0]) {
    if (!item.read) {
      markAsRead.mutate({ id: item.id });
    }
    const d = item.data as Record<string, unknown> | null;
    if (item.type === "JOB_MATCH" && d?.jobId) {
      router.push(`/(app)/(tabs)/jobs/${d.jobId as string}`);
    } else if (item.type === "APPLICATION_STATUS_CHANGE") {
      router.push("/(app)/(tabs)/applications");
    } else if (item.type === "ASSESSMENT_RESULT") {
      router.push("/(app)/(tabs)/assessments");
    }
  }

  function formatTime(date: Date | string) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  }

  return (
    <View className="flex-1" style={{ backgroundColor: c.surface }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Notifications",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: c.card },
          headerTintColor: c.fg,
          headerTitleStyle: { fontFamily: "Satoshi-Bold" },
          headerRight: () =>
            notifications.some((n) => !n.read) ? (
              <Pressable
                onPress={() => markAllAsRead.mutate()}
                className="mr-4"
              >
                <Text
                  className="font-medium text-sm"
                  style={{ color: c.primary }}
                >
                  Mark all read
                </Text>
              </Pressable>
            ) : null,
        }}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-sans text-base" style={{ color: c.mutedFg }}>
            No notifications yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                className="py-4"
                size="small"
                color={c.primary}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              className="border-b px-4 py-3"
              style={{
                backgroundColor: item.read ? c.surface : c.card,
                borderBottomColor: c.borderLight,
              }}
              onPress={() => handlePress(item)}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center gap-2">
                    {!item.read && (
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: c.primary }}
                      />
                    )}
                    <Text
                      className="font-bold text-sm"
                      style={{ color: c.fg }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <Text
                    className="mt-1 font-sans text-sm"
                    style={{ color: c.mutedFg }}
                    numberOfLines={2}
                  >
                    {item.body}
                  </Text>
                </View>
                <Text className="font-sans text-xs" style={{ color: c.mutedFg }}>
                  {formatTime(item.sentAt)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
