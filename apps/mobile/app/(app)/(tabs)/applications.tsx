import { useMemo } from "react";
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
import { useTheme } from "@/theme";
import type { ThemeColors } from "@/theme";

const statusColors: Record<string, string> = {
  APPLIED: "#3b82f6",
  INVITED: "#8b5cf6",
  INTERVIEW: "#f59e0b",
  HIRED: "#22c55e",
  REJECTED: "#ef4444",
};

export default function ApplicationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data, isLoading, refetch, isRefetching } =
    api.application.myApplications.useQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
      </View>
    );
  }

  const applications = data ?? [];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={
        applications.length === 0 ? styles.center : styles.list
      }
      data={applications}
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
          <Text style={styles.emptyText}>No applications yet</Text>
          <Text style={styles.emptySubtext}>
            Browse jobs and apply to get started
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/(app)/applications/${item.id}`)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.jobTitle}>{item.job.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[item.status] ?? colors.textTertiary },
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.company}>{item.job.client.name}</Text>
          <Text style={styles.date}>
            Applied {new Date(item.appliedAt).toLocaleDateString()}
          </Text>
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
    emptyText: { fontSize: 16, color: colors.textTertiary, fontFamily: "Satoshi-Regular", marginBottom: 4 },
    emptySubtext: { fontSize: 14, color: colors.textTertiary, fontFamily: "Satoshi-Regular" },
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
    jobTitle: {
      fontSize: 16,
      fontFamily: "Satoshi-Bold",
      flex: 1,
      marginRight: 8,
      color: colors.text,
    },
    statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    statusText: { fontSize: 11, color: "#fff", fontFamily: "Satoshi-Bold" },
    company: {
      fontSize: 14,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      marginBottom: 4,
    },
    date: { fontSize: 12, color: colors.textTertiary, fontFamily: "Satoshi-Regular" },
  });
