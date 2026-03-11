import {
  View,
  Text,
  ScrollView,
  Pressable,
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
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const submission = submissions?.find((s) => s.id === id);

  if (!submission) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="font-sans text-foreground">Assessment not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="p-4 pb-8">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-sans text-base text-muted-foreground">← Back</Text>
        </Pressable>

        <Text className="mb-1 font-bold text-2xl text-foreground">
          {submission.assessment.title}
        </Text>
        <Text className="mb-3 font-sans text-sm text-muted-foreground">
          Difficulty: {submission.assessment.difficulty}
        </Text>

        <View
          className="mb-5 self-start rounded-lg px-3 py-1.5"
          style={{
            backgroundColor: statusColors[submission.status] ?? "#999",
          }}
        >
          <Text className="font-bold text-xs text-white">
            {submission.status}
          </Text>
        </View>

        <View className="mb-4 rounded-xl bg-surface p-4">
          <Text className="mb-3 font-bold text-base text-foreground">Details</Text>
          <InfoRow
            label="Time Limit"
            value={`${submission.assessment.timeLimit} days`}
          />
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
          <View className="mb-4 rounded-xl bg-surface p-4">
            <Text className="mb-3 font-bold text-base text-foreground">
              Review Result
            </Text>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-bold text-base text-foreground">
                Average Score
              </Text>
              <Text
                className="font-bold text-xl"
                style={{
                  color: submission.review.passed ? "#22c55e" : "#ef4444",
                }}
              >
                {submission.review.averageScore.toFixed(1)} / 5.0
              </Text>
            </View>
            <Text
              className="mt-2 text-center font-bold text-base"
              style={{
                color: submission.review.passed ? "#22c55e" : "#ef4444",
              }}
            >
              {submission.review.passed ? "PASSED" : "NOT PASSED"}
            </Text>
          </View>
        )}

        {submission.forkUrl && (
          <View className="mb-4 rounded-xl bg-surface p-4">
            <Text className="mb-3 font-bold text-base text-foreground">
              Fork URL
            </Text>
            <Text className="font-sans text-sm text-muted-foreground leading-6">
              {submission.forkUrl}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between border-b border-border-light py-2">
      <Text className="font-sans text-sm text-muted-foreground">{label}</Text>
      <Text className="font-medium text-sm text-foreground">{value}</Text>
    </View>
  );
}
