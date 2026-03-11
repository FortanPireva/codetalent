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
  APPLIED: "#3b82f6",
  INVITED: "#8b5cf6",
  INTERVIEW: "#f59e0b",
  HIRED: "#22c55e",
  REJECTED: "#ef4444",
};

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: applications, isLoading } =
    api.application.myApplications.useQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const application = applications?.find((a) => a.id === id);

  if (!application) {
    return (
      <View style={styles.center}>
        <Text>Application not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}><ScrollView contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{application.job.title}</Text>
      <Text style={styles.company}>{application.job.client.name}</Text>

      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusColors[application.status] ?? "#999" },
        ]}
      >
        <Text style={styles.statusText}>{application.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <InfoRow
          label="Applied"
          value={new Date(application.appliedAt).toLocaleDateString()}
        />
        <InfoRow
          label="Last Updated"
          value={new Date(application.updatedAt).toLocaleDateString()}
        />
      </View>

      {application.coverLetter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <Text style={styles.body}>{application.coverLetter}</Text>
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
  content: { padding: 16 },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 16, color: "#666" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  company: { fontSize: 16, color: "#666", marginBottom: 12 },
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
