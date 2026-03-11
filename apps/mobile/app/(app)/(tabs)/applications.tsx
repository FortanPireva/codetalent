import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/trpc";
import { useThemeColors } from "@/hooks/useThemeColors";

const statusColors: Record<string, string> = {
  APPLIED: "#3b82f6",
  INVITED: "#8b5cf6",
  INTERVIEW: "#f59e0b",
  HIRED: "#22c55e",
  REJECTED: "#ef4444",
};

export default function ApplicationsScreen() {
  const c = useThemeColors();
  const { data, isLoading, refetch, isRefetching } =
    api.application.myApplications.useQuery();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.surface }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const applications = data ?? [];

  return (
    <FlatList
      className="flex-1"
      style={{ backgroundColor: c.surface }}
      contentContainerStyle={
        applications.length === 0
          ? { flex: 1, justifyContent: "center", alignItems: "center" }
          : { padding: 16 }
      }
      data={applications}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={
        <View className="items-center p-8">
          <Text className="mb-1 font-sans text-base" style={{ color: c.placeholder }}>
            No applications yet
          </Text>
          <Text className="font-sans text-sm" style={{ color: c.placeholder }}>
            Browse jobs and apply to get started
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          className="mb-3 rounded-xl p-4 shadow-sm"
          style={{ backgroundColor: c.card }}
          onPress={() => router.push(`/(app)/applications/${item.id}`)}
        >
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="mr-2 flex-1 font-bold text-base" style={{ color: c.fg }}>
              {item.job.title}
            </Text>
            <View
              className="rounded-md px-2 py-0.5"
              style={{ backgroundColor: statusColors[item.status] ?? "#999" }}
            >
              <Text className="font-bold text-xs text-white">{item.status}</Text>
            </View>
          </View>
          <Text className="mb-1 font-sans text-sm" style={{ color: c.mutedFg }}>
            {item.job.client.name}
          </Text>
          <Text className="font-sans text-xs" style={{ color: c.placeholder }}>
            Applied {new Date(item.appliedAt).toLocaleDateString()}
          </Text>
        </Pressable>
      )}
    />
  );
}
