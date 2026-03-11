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
  ASSIGNED: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  SUBMITTED: "#8b5cf6",
  UNDER_REVIEW: "#6366f1",
  PASSED: "#22c55e",
  REJECTED: "#ef4444",
};

export default function AssessmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: submissions, isLoading } =
    api.assessment.mySubmissions.useQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
      </View>
    );
  }

  const submission = submissions?.find((s) => s.id === id);

  if (!submission) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.text, fontFamily: "Satoshi-Regular" }}>
          Assessment not found
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

        <Text style={styles.title}>{submission.assessment.title}</Text>
        <Text style={styles.difficulty}>
          Difficulty: {submission.assessment.difficulty}
        </Text>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[submission.status] ?? colors.textTertiary },
          ]}
        >
          <Text style={styles.statusText}>{submission.status}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <InfoRow label="Time Limit" value={`${submission.assessment.timeLimit} days`} colors={colors} />
          {submission.startedAt && (
            <InfoRow
              label="Started"
              value={new Date(submission.startedAt).toLocaleDateString()}
              colors={colors}
            />
          )}
          {submission.submittedAt && (
            <InfoRow
              label="Submitted"
              value={new Date(submission.submittedAt).toLocaleDateString()}
              colors={colors}
            />
          )}
        </View>

        {submission.review && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review Result</Text>
            <View style={styles.scoreHeader}>
              <Text style={styles.averageLabel}>Average Score</Text>
              <Text
                style={[
                  styles.averageScore,
                  { color: submission.review.passed ? colors.green : colors.red },
                ]}
              >
                {submission.review.averageScore.toFixed(1)} / 5.0
              </Text>
            </View>
            <Text
              style={[
                styles.resultText,
                { color: submission.review.passed ? colors.green : colors.red },
              ]}
            >
              {submission.review.passed ? "PASSED" : "NOT PASSED"}
            </Text>
          </View>
        )}

        {submission.forkUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fork URL</Text>
            <Text style={styles.body}>{submission.forkUrl}</Text>
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
    content: { padding: 16, paddingBottom: 32 },
    backButton: { marginBottom: 16 },
    backText: { fontSize: 16, color: colors.textSecondary, fontFamily: "Satoshi-Regular" },
    title: { fontSize: 24, fontFamily: "Satoshi-Bold", marginBottom: 4, color: colors.text },
    difficulty: {
      fontSize: 14,
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
    scoreHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    averageLabel: { fontSize: 16, fontFamily: "Satoshi-Bold", color: colors.text },
    averageScore: { fontSize: 20, fontFamily: "Satoshi-Bold" },
    resultText: {
      fontSize: 16,
      fontFamily: "Satoshi-Bold",
      textAlign: "center",
      marginTop: 8,
    },
  });
