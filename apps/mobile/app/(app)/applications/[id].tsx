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
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const application = applications?.find((a) => a.id === id);

  if (!application) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="font-sans text-foreground">Application not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="p-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-sans text-base text-muted-foreground">← Back</Text>
        </Pressable>

        <Text className="mb-1 font-bold text-2xl text-foreground">
          {application.job.title}
        </Text>
        <Text className="mb-3 font-sans text-base text-muted-foreground">
          {application.job.client.name}
        </Text>

        <View
          className="mb-5 self-start rounded-lg px-3 py-1.5"
          style={{
            backgroundColor: statusColors[application.status] ?? "#999",
          }}
        >
          <Text className="font-bold text-xs text-white">
            {application.status}
          </Text>
        </View>

        <View className="mb-4 rounded-xl bg-surface p-4">
          <Text className="mb-3 font-bold text-base text-foreground">Timeline</Text>
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
          <View className="mb-4 rounded-xl bg-surface p-4">
            <Text className="mb-3 font-bold text-base text-foreground">
              Cover Letter
            </Text>
            <Text className="font-sans text-sm text-muted-foreground leading-6">
              {application.coverLetter}
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
