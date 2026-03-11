import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "@/lib/trpc";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, isLoading } = api.job.candidateGetById.useQuery({ id: id! });
  const utils = api.useUtils();

  const applyMutation = api.application.apply.useMutation({
    onSuccess: () => {
      Alert.alert("Success", "Application submitted!");
      utils.application.myApplications.invalidate();
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text>Job not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{job.client.name}</Text>

        <View style={styles.tags}>
          {job.experienceLevel && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.experienceLevel}</Text>
            </View>
          )}
          {job.employmentType && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.employmentType}</Text>
            </View>
          )}
          {job.workArrangement && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.workArrangement}</Text>
            </View>
          )}
          {job.location && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.location}</Text>
            </View>
          )}
        </View>

        {job.showSalary && job.salaryMin && job.salaryMax && (
          <Text style={styles.salary}>
            {job.salaryCurrency} {job.salaryMin.toLocaleString()} -{" "}
            {job.salaryMax.toLocaleString()} / {job.salaryPeriod}
          </Text>
        )}

        {job.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.body}>{job.summary}</Text>
          </View>
        )}

        {job.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.body}>{job.description}</Text>
          </View>
        )}

        {job.requiredSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillList}>
              {job.requiredSkills.map((skill) => (
                <View key={skill} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {job.benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            {job.benefits.map((benefit) => (
              <Text key={benefit} style={styles.bulletItem}>
                • {benefit}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <TouchableOpacity
          style={[styles.applyButton, applyMutation.isLoading && styles.disabled]}
          onPress={() => applyMutation.mutate({ jobId: id! })}
          disabled={applyMutation.isLoading}
        >
          <Text style={styles.applyText}>
            {applyMutation.isLoading ? "Applying..." : "Apply Now"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 100 },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 16, color: "#666" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  company: { fontSize: 16, color: "#666", marginBottom: 12 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontSize: 12, color: "#555" },
  salary: { fontSize: 16, fontWeight: "600", color: "#22c55e", marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  body: { fontSize: 14, color: "#444", lineHeight: 22 },
  skillList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillTag: {
    backgroundColor: "#e0e7ff",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skillText: { fontSize: 13, color: "#4338ca" },
  bulletItem: { fontSize: 14, color: "#444", marginBottom: 4 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  applyButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  disabled: { opacity: 0.6 },
  applyText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
