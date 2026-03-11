import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const jobs = data ?? [];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={jobs.length === 0 ? styles.center : styles.list}
      data={jobs}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No jobs available</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/(app)/jobs/${item.id}`)}
        >
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.company}>{item.client.name}</Text>
          <View style={styles.tags}>
            {item.experienceLevel && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.experienceLevel}</Text>
              </View>
            )}
            {item.workArrangement && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.workArrangement}</Text>
              </View>
            )}
            {item.employmentType && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.employmentType}</Text>
              </View>
            )}
          </View>
          {item.location && (
            <Text style={styles.location}>{item.location}</Text>
          )}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  empty: { alignItems: "center", padding: 32 },
  emptyText: { fontSize: 16, color: "#999" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  jobTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  company: { fontSize: 14, color: "#666", marginBottom: 8 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  tag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: "#555" },
  location: { fontSize: 13, color: "#888", marginTop: 4 },
});
