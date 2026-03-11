import { useMemo } from "react";
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
import { useTheme } from "@/theme";
import type { ThemeColors } from "@/theme";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
        <ActivityIndicator size="large" color={colors.textSecondary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.text, fontFamily: "Satoshi-Regular" }}>
          Job not found
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: { padding: 16, paddingBottom: 100 },
    backButton: { marginBottom: 16 },
    backText: { fontSize: 16, color: colors.textSecondary, fontFamily: "Satoshi-Regular" },
    title: { fontSize: 24, fontFamily: "Satoshi-Bold", marginBottom: 4, color: colors.text },
    company: {
      fontSize: 16,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      marginBottom: 12,
    },
    tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
    tag: {
      backgroundColor: colors.tag,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    tagText: { fontSize: 12, color: colors.textSecondary, fontFamily: "Satoshi-Medium" },
    salary: {
      fontSize: 16,
      fontFamily: "Satoshi-Bold",
      color: colors.green,
      marginBottom: 16,
    },
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Satoshi-Bold",
      marginBottom: 8,
      color: colors.text,
    },
    body: {
      fontSize: 14,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      lineHeight: 22,
    },
    skillList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    skillTag: {
      backgroundColor: colors.skillTag,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    skillText: { fontSize: 13, color: colors.skillTagText, fontFamily: "Satoshi-Medium" },
    bulletItem: {
      fontSize: 14,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      marginBottom: 4,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      paddingBottom: 32,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    applyButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    disabled: { opacity: 0.6 },
    applyText: { color: colors.primaryText, fontSize: 16, fontFamily: "Satoshi-Medium" },
  });
