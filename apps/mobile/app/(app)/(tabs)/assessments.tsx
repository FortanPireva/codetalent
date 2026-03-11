import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const submissions = data ?? [];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={
        submissions.length === 0 ? styles.center : styles.list
      }
      data={submissions}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No assessments assigned</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/(app)/assessments/${item.id}`)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{item.assessment.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[item.status] ?? "#999" },
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.difficulty}>
            {item.assessment.difficulty}
          </Text>
          {item.review && (
            <Text style={styles.score}>
              Score: {item.review.averageScore.toFixed(1)} / 5.0
            </Text>
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: "600", flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, color: "#fff", fontWeight: "600" },
  difficulty: { fontSize: 13, color: "#666", marginBottom: 4 },
  score: { fontSize: 13, color: "#22c55e", fontWeight: "500" },
});
