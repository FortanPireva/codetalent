import { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/trpc";
import { useTheme } from "@/theme";
import type { ThemeColors } from "@/theme";

const statusColors: Record<string, string> = {
  ASSIGNED: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  SUBMITTED: "#8b5cf6",
  UNDER_REVIEW: "#6366f1",
  PASSED: "#22c55e",
  REJECTED: "#ef4444",
};

export default function AssessmentsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data, isLoading, refetch, isRefetching } =
    api.assessment.mySubmissions.useQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
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
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.textSecondary}
        />
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
                { backgroundColor: statusColors[item.status] ?? colors.textTertiary },
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    list: { padding: 16 },
    empty: { alignItems: "center", padding: 32 },
    emptyText: { fontSize: 16, color: colors.textTertiary, fontFamily: "Satoshi-Regular" },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
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
    title: {
      fontSize: 16,
      fontFamily: "Satoshi-Bold",
      flex: 1,
      marginRight: 8,
      color: colors.text,
    },
    statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    statusText: { fontSize: 11, color: "#fff", fontFamily: "Satoshi-Bold" },
    difficulty: {
      fontSize: 13,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      marginBottom: 4,
    },
    score: {
      fontSize: 13,
      fontFamily: "Satoshi-Medium",
      color: colors.green,
    },
  });
