import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  REVIEWING: "#6366f1",
  SHORTLISTED: "#3b82f6",
  INTERVIEW: "#8b5cf6",
  OFFERED: "#22c55e",
  HIRED: "#10b981",
  REJECTED: "#ef4444",
  WITHDRAWN: "#6b7280",
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const c = useThemeColors();

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = api.auth.getProfile.useQuery();

  const { data: submissions, refetch: refetchSubmissions } =
    api.assessment.mySubmissions.useQuery(undefined, { enabled: !!profile });

  const { data: applications, refetch: refetchApplications } =
    api.application.myApplications.useQuery(undefined, { enabled: !!profile });

  const isRefetching = false;
  const onRefresh = async () => {
    await Promise.all([refetchProfile(), refetchSubmissions(), refetchApplications()]);
  };

  if (profileLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.surface }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const activeAssessments = submissions?.filter((s) => s.status === "IN_PROGRESS") ?? [];
  const recentApps = (applications ?? []).slice(0, 5);

  const hasSubmissionsUnderReview =
    submissions?.some(
      (s) => s.status === "UNDER_REVIEW" || s.status === "SUBMITTED",
    ) ?? false;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: c.surface }}
      contentContainerClassName="p-4 pb-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
      }
    >
      {/* Greeting */}
      <View className="mb-5">
        <Text className="font-bold text-2xl" style={{ color: c.fg }}>
          Hello, {user?.name ?? profile?.name ?? "there"}
        </Text>
        <Text className="mt-1 font-sans text-sm" style={{ color: c.mutedFg }}>
          {dateStr}
        </Text>
      </View>

      {/* Verification Status */}
      {profile && (
        <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.card }}>
          <VerifiedBadge
            passedAssessmentCount={profile.passedAssessmentCount}
            hasSubmissionsUnderReview={hasSubmissionsUnderReview}
          />
        </View>
      )}

      {/* Active Assessments */}
      {activeAssessments.length > 0 && (
        <View className="mb-4">
          <Text className="mb-2 font-bold text-base" style={{ color: c.fg }}>
            Active Assessments
          </Text>
          {activeAssessments.map((sub) => (
            <Pressable
              key={sub.id}
              className="mb-2 rounded-xl p-4"
              style={{ backgroundColor: c.card }}
              onPress={() => router.push(`/(app)/assessments/${sub.id}`)}
            >
              <View className="flex-row items-center justify-between">
                <View className="mr-3 flex-1">
                  <Text className="font-bold text-sm" style={{ color: c.fg }}>
                    {sub.assessment.title}
                  </Text>
                  <Text className="mt-0.5 font-sans text-xs" style={{ color: c.mutedFg }}>
                    {sub.assessment.difficulty}
                  </Text>
                </View>
                <View className="rounded-lg px-3 py-1.5" style={{ backgroundColor: c.primary }}>
                  <Text className="font-medium text-xs" style={{ color: c.primaryFg }}>
                    Continue
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Recent Applications */}
      <View className="mb-4">
        <Text className="mb-2 font-bold text-base" style={{ color: c.fg }}>
          Recent Applications
        </Text>
        {recentApps.length > 0 ? (
          recentApps.map((app) => (
            <Pressable
              key={app.id}
              className="mb-2 rounded-xl p-4"
              style={{ backgroundColor: c.card }}
              onPress={() => router.push(`/(app)/applications/${app.id}`)}
            >
              <View className="flex-row items-center justify-between">
                <View className="mr-3 flex-1">
                  <Text className="font-bold text-sm" style={{ color: c.fg }}>
                    {app.job.title}
                  </Text>
                  <Text className="mt-0.5 font-sans text-xs" style={{ color: c.mutedFg }}>
                    {app.job.client?.name ?? "Company"}
                  </Text>
                </View>
                <View
                  className="rounded-md px-2 py-0.5"
                  style={{ backgroundColor: statusColors[app.status] ?? "#999" }}
                >
                  <Text className="font-bold text-xs text-white">{app.status}</Text>
                </View>
              </View>
              <Text className="mt-1 font-sans text-xs" style={{ color: c.mutedFg }}>
                Applied {new Date(app.createdAt).toLocaleDateString()}
              </Text>
            </Pressable>
          ))
        ) : (
          <View className="rounded-xl p-4" style={{ backgroundColor: c.card }}>
            <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
              No applications yet
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View className="flex-row gap-3">
        <Pressable
          className="flex-1 items-center rounded-xl py-3.5"
          style={{ backgroundColor: c.primary }}
          onPress={() => router.push("/(app)/(tabs)/jobs")}
        >
          <Text className="font-medium text-sm" style={{ color: c.primaryFg }}>
            Browse Jobs
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 items-center rounded-xl py-3.5"
          style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}
          onPress={() => router.push("/(app)/profile")}
        >
          <Text className="font-medium text-sm" style={{ color: c.fg }}>
            View Profile
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
