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

const statusColors: Record<string, string> = {
  ASSIGNED: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  SUBMITTED: "#8b5cf6",
  UNDER_REVIEW: "#6366f1",
  PASSED: "#22c55e",
  REJECTED: "#ef4444",
};

export default function AssessmentsScreen() {
  const { data, isLoading, refetch, isRefetching } =
    api.assessment.mySubmissions.useQuery();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const submissions = data ?? [];

  return (
    <FlatList
      className="flex-1 bg-surface"
      contentContainerStyle={
        submissions.length === 0
          ? { flex: 1, justifyContent: "center", alignItems: "center" }
          : { padding: 16 }
      }
      data={submissions}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={
        <View className="items-center p-8">
          <Text className="font-sans text-base text-placeholder">
            No assessments assigned
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          className="mb-3 rounded-xl bg-card p-4 shadow-sm"
          onPress={() => router.push(`/(app)/assessments/${item.id}`)}
        >
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="mr-2 flex-1 font-bold text-base text-foreground">
              {item.assessment.title}
            </Text>
            <View
              className="rounded-md px-2 py-0.5"
              style={{ backgroundColor: statusColors[item.status] ?? "#999" }}
            >
              <Text className="font-bold text-xs text-white">{item.status}</Text>
            </View>
          </View>
          <Text className="mb-1 font-sans text-xs text-muted-foreground">
            {item.assessment.difficulty}
          </Text>
          {item.review && (
            <Text className="font-medium text-xs text-status-green">
              Score: {item.review.averageScore.toFixed(1)} / 5.0
            </Text>
          )}
        </Pressable>
      )}
    />
  );
}
