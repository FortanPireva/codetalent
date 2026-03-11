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
  const { data: submissions, isLoading } =
    api.assessment.mySubmissions.useQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const submission = submissions?.find((s) => s.id === id);

  if (!submission) {
    return (
      <View style={styles.center}>
        <Text>Assessment not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}><ScrollView contentContainerStyle={styles.content}>
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
          { backgroundColor: statusColors[submission.status] ?? "#999" },
        ]}
      >
        <Text style={styles.statusText}>{submission.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <InfoRow label="Time Limit" value={`${submission.assessment.timeLimit} days`} />
        {submission.startedAt && (
          <InfoRow
            label="Started"
            value={new Date(submission.startedAt).toLocaleDateString()}
          />
        )}
        {submission.submittedAt && (
          <InfoRow
            label="Submitted"
            value={new Date(submission.submittedAt).toLocaleDateString()}
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
                { color: submission.review.passed ? "#22c55e" : "#ef4444" },
              ]}
            >
              {submission.review.averageScore.toFixed(1)} / 5.0
            </Text>
          </View>
          <Text
            style={[
              styles.resultText,
              { color: submission.review.passed ? "#22c55e" : "#ef4444" },
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
    </ScrollView></SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 32 },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 16, color: "#666" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  difficulty: { fontSize: 14, color: "#666", marginBottom: 12 },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  statusText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  section: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  body: { fontSize: 14, color: "#444", lineHeight: 22 },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  averageLabel: { fontSize: 16, fontWeight: "600" },
  averageScore: { fontSize: 20, fontWeight: "bold" },
  resultText: { fontSize: 16, fontWeight: "700", textAlign: "center", marginTop: 8 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, fontWeight: "500" },
});
