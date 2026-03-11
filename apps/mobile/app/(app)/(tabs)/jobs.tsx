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

export default function JobsScreen() {
  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = api.job.candidateList.useQuery({});

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const jobs = data ?? [];

  return (
    <FlatList
      className="flex-1 bg-surface"
      contentContainerStyle={jobs.length === 0 ? { flex: 1, justifyContent: "center", alignItems: "center" } : { padding: 16 }}
      data={jobs}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={
        <View className="items-center p-8">
          <Text className="font-sans text-base text-placeholder">No jobs available</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          className="mb-3 rounded-xl bg-card p-4 shadow-sm"
          onPress={() => router.push(`/(app)/jobs/${item.id}`)}
        >
          <Text className="mb-1 font-bold text-lg text-foreground">{item.title}</Text>
          <Text className="mb-2 font-sans text-sm text-muted-foreground">
            {item.client.name}
          </Text>
          <View className="mb-1.5 flex-row flex-wrap gap-1.5">
            {item.experienceLevel && (
              <View className="rounded-md bg-tag px-2 py-1">
                <Text className="font-medium text-xs text-muted-foreground">
                  {item.experienceLevel}
                </Text>
              </View>
            )}
            {item.workArrangement && (
              <View className="rounded-md bg-tag px-2 py-1">
                <Text className="font-medium text-xs text-muted-foreground">
                  {item.workArrangement}
                </Text>
              </View>
            )}
            {item.employmentType && (
              <View className="rounded-md bg-tag px-2 py-1">
                <Text className="font-medium text-xs text-muted-foreground">
                  {item.employmentType}
                </Text>
              </View>
            )}
          </View>
          {item.location && (
            <Text className="mt-1 font-sans text-xs text-placeholder">
              {item.location}
            </Text>
          )}
        </Pressable>
      )}
    />
  );
}
