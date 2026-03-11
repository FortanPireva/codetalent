import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "@/lib/trpc";
import { useThemeColors } from "@/hooks/useThemeColors";

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
  const c = useThemeColors();
  const { data: submissions, isLoading } =
    api.assessment.mySubmissions.useQuery();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.bg }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const submission = submissions?.find((s) => s.id === id);

  if (!submission) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.bg }}>
        <Text className="font-sans" style={{ color: c.fg }}>Assessment not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: c.bg }} contentContainerClassName="p-4 pb-8">
        <Text className="mb-1 font-bold text-2xl" style={{ color: c.fg }}>
          {submission.assessment.title}
        </Text>
        <Text className="mb-3 font-sans text-sm" style={{ color: c.mutedFg }}>
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

        <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.surface }}>
          <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>Details</Text>
          <InfoRow
            label="Time Limit"
            value={`${submission.assessment.timeLimit} days`}
            colors={c}
          />
          {submission.startedAt && (
            <InfoRow
              label="Started"
              value={new Date(submission.startedAt).toLocaleDateString()}
              colors={c}
            />
          )}
          {submission.submittedAt && (
            <InfoRow
              label="Submitted"
              value={new Date(submission.submittedAt).toLocaleDateString()}
              colors={c}
            />
          )}
        </View>

        {submission.review && (
          <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.surface }}>
            <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
              Review Result
            </Text>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-bold text-base" style={{ color: c.fg }}>
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
          <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.surface }}>
            <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
              Fork URL
            </Text>
            <Text className="font-sans text-sm leading-6" style={{ color: c.mutedFg }}>
              {submission.forkUrl}
            </Text>
          </View>
        )}
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  colors: c,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View
      className="flex-row justify-between py-2"
      style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight }}
    >
      <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>{label}</Text>
      <Text className="font-medium text-sm" style={{ color: c.fg }}>{value}</Text>
    </View>
  );
}
