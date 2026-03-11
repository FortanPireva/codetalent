import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
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

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: applications, isLoading } =
    api.application.myApplications.useQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
      </View>
    );
  }

  const application = applications?.find((a) => a.id === id);

  if (!application) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.text, fontFamily: "Satoshi-Regular" }}>
          Application not found
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{application.job.title}</Text>
        <Text style={styles.company}>{application.job.client.name}</Text>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[application.status] ?? colors.textTertiary },
          ]}
        >
          <Text style={styles.statusText}>{application.status}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <InfoRow
            label="Applied"
            value={new Date(application.appliedAt).toLocaleDateString()}
            colors={colors}
          />
          <InfoRow
            label="Last Updated"
            value={new Date(application.updatedAt).toLocaleDateString()}
            colors={colors}
          />
        </View>

        {application.coverLetter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cover Letter</Text>
            <Text style={styles.body}>{application.coverLetter}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
      }}
    >
      <Text style={{ fontSize: 14, color: colors.textSecondary, fontFamily: "Satoshi-Regular" }}>
        {label}
      </Text>
      <Text style={{ fontSize: 14, fontFamily: "Satoshi-Medium", color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: { padding: 16 },
    backButton: { marginBottom: 16 },
    backText: { fontSize: 16, color: colors.textSecondary, fontFamily: "Satoshi-Regular" },
    title: { fontSize: 24, fontFamily: "Satoshi-Bold", marginBottom: 4, color: colors.text },
    company: {
      fontSize: 16,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      marginBottom: 12,
    },
    statusBadge: {
      alignSelf: "flex-start",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 20,
    },
    statusText: { color: "#fff", fontFamily: "Satoshi-Bold", fontSize: 13 },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Satoshi-Bold",
      marginBottom: 12,
      color: colors.text,
    },
    body: {
      fontSize: 14,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      lineHeight: 22,
    },
  });
