import {
  View,
  Text,
  ScrollView,
  Pressable,
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
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!job) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="font-sans text-foreground">Job not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="p-4 pb-28">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-sans text-base text-muted-foreground">← Back</Text>
        </Pressable>

        <Text className="mb-1 font-bold text-2xl text-foreground">{job.title}</Text>
        <Text className="mb-3 font-sans text-base text-muted-foreground">
          {job.client.name}
        </Text>

        <View className="mb-3 flex-row flex-wrap gap-1.5">
          {job.experienceLevel && (
            <View className="rounded-md bg-tag px-2.5 py-1.5">
              <Text className="font-medium text-xs text-muted-foreground">
                {job.experienceLevel}
              </Text>
            </View>
          )}
          {job.employmentType && (
            <View className="rounded-md bg-tag px-2.5 py-1.5">
              <Text className="font-medium text-xs text-muted-foreground">
                {job.employmentType}
              </Text>
            </View>
          )}
          {job.workArrangement && (
            <View className="rounded-md bg-tag px-2.5 py-1.5">
              <Text className="font-medium text-xs text-muted-foreground">
                {job.workArrangement}
              </Text>
            </View>
          )}
          {job.location && (
            <View className="rounded-md bg-tag px-2.5 py-1.5">
              <Text className="font-medium text-xs text-muted-foreground">
                {job.location}
              </Text>
            </View>
          )}
        </View>

        {job.showSalary && job.salaryMin && job.salaryMax && (
          <Text className="mb-4 font-bold text-base text-status-green">
            {job.salaryCurrency} {job.salaryMin.toLocaleString()} -{" "}
            {job.salaryMax.toLocaleString()} / {job.salaryPeriod}
          </Text>
        )}

        {job.summary && (
          <View className="mb-5">
            <Text className="mb-2 font-bold text-lg text-foreground">Summary</Text>
            <Text className="font-sans text-sm text-muted-foreground leading-6">
              {job.summary}
            </Text>
          </View>
        )}

        {job.description && (
          <View className="mb-5">
            <Text className="mb-2 font-bold text-lg text-foreground">Description</Text>
            <Text className="font-sans text-sm text-muted-foreground leading-6">
              {job.description}
            </Text>
          </View>
        )}

        {job.requiredSkills.length > 0 && (
          <View className="mb-5">
            <Text className="mb-2 font-bold text-lg text-foreground">
              Required Skills
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {job.requiredSkills.map((skill) => (
                <View key={skill} className="rounded-md bg-skill-tag px-2.5 py-1.5">
                  <Text className="font-medium text-xs text-skill-tag-text">
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {job.benefits.length > 0 && (
          <View className="mb-5">
            <Text className="mb-2 font-bold text-lg text-foreground">Benefits</Text>
            {job.benefits.map((benefit) => (
              <Text
                key={benefit}
                className="mb-1 font-sans text-sm text-muted-foreground"
              >
                • {benefit}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      <SafeAreaView
        edges={["bottom"]}
        className="absolute bottom-0 left-0 right-0 border-t border-border-light bg-background px-4 pb-8 pt-4"
      >
        <Pressable
          className={`items-center rounded-xl bg-primary py-4 ${applyMutation.isLoading ? "opacity-60" : ""}`}
          onPress={() => applyMutation.mutate({ jobId: id! })}
          disabled={applyMutation.isLoading}
        >
          <Text className="font-medium text-base text-primary-foreground">
            {applyMutation.isLoading ? "Applying..." : "Apply Now"}
          </Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}
