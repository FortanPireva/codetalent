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

export default function JobsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = api.job.candidateList.useQuery({});

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
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
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.textSecondary}
        />
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
    jobTitle: {
      fontSize: 18,
      fontFamily: "Satoshi-Bold",
      marginBottom: 4,
      color: colors.text,
    },
    company: {
      fontSize: 14,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      marginBottom: 8,
    },
    tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
    tag: {
      backgroundColor: colors.tag,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    tagText: { fontSize: 12, color: colors.textSecondary, fontFamily: "Satoshi-Medium" },
    location: {
      fontSize: 13,
      fontFamily: "Satoshi-Regular",
      color: colors.textTertiary,
      marginTop: 4,
    },
  });
