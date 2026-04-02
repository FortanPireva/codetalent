import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Briefcase, MapPin, Clock, ChevronRight, FileText } from "lucide-react-native";
import { api } from "@/lib/trpc";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  applicationStatusLabels,
  experienceLevelLabels,
  employmentTypeLabels,
  formatRelativeDate,
  formatSalary,
} from "@/lib/constants";

const statusDotColors: Record<string, string> = {
  APPLIED: "#3b82f6",
  INVITED: "#8b5cf6",
  INTERVIEW: "#f59e0b",
  HIRED: "#22c55e",
  REJECTED: "#ef4444",
};

export default function ApplicationsScreen() {
  const c = useThemeColors();
  const { data, isLoading, refetch, isRefetching } =
    api.application.myApplications.useQuery();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.surface }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const applications = data ?? [];

  return (
    <View className="flex-1" style={{ backgroundColor: c.surface }}>
      <ScreenHeader />
      <FlatList
        className="flex-1"
        contentContainerStyle={
          applications.length === 0
            ? { flex: 1, justifyContent: "center", alignItems: "center" }
            : { padding: 16, paddingBottom: 100 }
        }
        data={applications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center p-8">
            <View
              className="mb-4 h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${c.primary}12` }}
            >
              <FileText size={28} strokeWidth={1.5} color={c.primary} />
            </View>
            <Text className="mb-1 font-bold text-base" style={{ color: c.fg }}>
              No applications yet
            </Text>
            <Text className="text-center font-sans text-sm" style={{ color: c.mutedFg }}>
              Browse jobs and apply to get started
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const dotColor = statusDotColors[item.status] ?? c.mutedFg;
          const statusLabel = applicationStatusLabels[item.status] ?? item.status;
          const salary =
            item.job.showSalary && item.job.salaryMin && item.job.salaryMax
              ? formatSalary(item.job.salaryMin, item.job.salaryMax, item.job.salaryCurrency, item.job.salaryPeriod)
              : null;

          return (
            <Pressable
              className="mb-3 rounded-xl p-4"
              style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.borderLight }}
              onPress={() => router.push(`/(app)/applications/${item.id}`)}
            >
              {/* Header: title + chevron */}
              <View className="mb-2 flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                  <Text className="font-bold text-base" style={{ color: c.fg }} numberOfLines={2}>
                    {item.job.title}
                  </Text>
                  <Text className="mt-0.5 font-sans text-sm" style={{ color: c.mutedFg }}>
                    {item.job.client.name}
                  </Text>
                </View>
                <ChevronRight size={18} strokeWidth={1.5} color={c.placeholder} />
              </View>

              {/* Meta pills */}
              <View className="mb-3 flex-row flex-wrap gap-2">
                {item.job.location && (
                  <View className="flex-row items-center gap-1">
                    <MapPin size={12} strokeWidth={1.5} color={c.placeholder} />
                    <Text className="font-sans text-xs" style={{ color: c.mutedFg }}>
                      {item.job.location}
                    </Text>
                  </View>
                )}
                {item.job.employmentType && (
                  <View className="flex-row items-center gap-1">
                    <Briefcase size={12} strokeWidth={1.5} color={c.placeholder} />
                    <Text className="font-sans text-xs" style={{ color: c.mutedFg }}>
                      {employmentTypeLabels[item.job.employmentType] ?? item.job.employmentType}
                    </Text>
                  </View>
                )}
                {item.job.experienceLevel && (
                  <Text className="font-sans text-xs" style={{ color: c.mutedFg }}>
                    {experienceLevelLabels[item.job.experienceLevel] ?? item.job.experienceLevel}
                  </Text>
                )}
              </View>

              {salary && (
                <Text className="mb-3 font-bold text-sm" style={{ color: c.fg }}>
                  {salary}
                </Text>
              )}

              {/* Footer: status + date */}
              <View
                className="flex-row items-center justify-between pt-3"
                style={{ borderTopWidth: 1, borderTopColor: c.borderLight }}
              >
                <View className="flex-row items-center gap-1.5">
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: dotColor,
                    }}
                  />
                  <Text className="font-medium text-xs" style={{ color: c.fg }}>
                    {statusLabel}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Clock size={12} strokeWidth={1.5} color={c.placeholder} />
                  <Text className="font-sans text-xs" style={{ color: c.placeholder }}>
                    {formatRelativeDate(item.appliedAt)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
