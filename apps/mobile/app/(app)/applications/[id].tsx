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
  APPLIED: "#3b82f6",
  INVITED: "#8b5cf6",
  INTERVIEW: "#f59e0b",
  HIRED: "#22c55e",
  REJECTED: "#ef4444",
};

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useThemeColors();
  const { data: applications, isLoading } =
    api.application.myApplications.useQuery();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.bg }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const application = applications?.find((a) => a.id === id);

  if (!application) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.bg }}>
        <Text className="font-sans" style={{ color: c.fg }}>Application not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: c.bg }} contentContainerClassName="p-4">
        <Text className="mb-1 font-bold text-2xl" style={{ color: c.fg }}>
          {application.job.title}
        </Text>
        <Text className="mb-3 font-sans text-base" style={{ color: c.mutedFg }}>
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

        <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.surface }}>
          <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>Timeline</Text>
          <InfoRow
            label="Applied"
            value={new Date(application.appliedAt).toLocaleDateString()}
            colors={c}
          />
          <InfoRow
            label="Last Updated"
            value={new Date(application.updatedAt).toLocaleDateString()}
            colors={c}
          />
        </View>

        {application.coverLetter && (
          <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.surface }}>
            <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
              Cover Letter
            </Text>
            <Text className="font-sans text-sm leading-6" style={{ color: c.mutedFg }}>
              {application.coverLetter}
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
