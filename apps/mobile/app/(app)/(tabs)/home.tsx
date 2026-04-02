import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Briefcase,
  Search,
  UserPen,
  ChevronRight,
  FileText,
  ClipboardCheck,
  Target,
  Sparkles,
} from "lucide-react-native";
import { api } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { applicationStatusColors as statusColors } from "@/lib/statusColors";

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
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const activeAssessments = submissions?.filter((s) => s.status === "IN_PROGRESS") ?? [];
  const recentApps = (applications ?? []).slice(0, 3);
  const totalApplications = applications?.length ?? 0;
  const totalAssessments = submissions?.length ?? 0;
  const passedAssessments = submissions?.filter((s) => s.status === "PASSED")?.length ?? 0;

  const hasSubmissionsUnderReview =
    submissions?.some(
      (s) => s.status === "UNDER_REVIEW" || s.status === "SUBMITTED",
    ) ?? false;

  // Profile completeness
  const profileChecks = [
    { done: !!profile?.bio, label: "Add a bio" },
    { done: (profile?.skills?.length ?? 0) > 0, label: "Add skills" },
    { done: !!profile?.githubUrl || !!profile?.linkedinUrl, label: "Add links" },
    { done: !!profile?.location, label: "Add location" },
    { done: !!profile?.hourlyRate || !!profile?.monthlyRate, label: "Set your rates" },
  ];
  const completedChecks = profileChecks.filter((ch) => ch.done).length;
  const profilePercent = Math.round((completedChecks / profileChecks.length) * 100);
  const incompleteTasks = profileChecks.filter((ch) => !ch.done);

  return (
    <View className="flex-1" style={{ backgroundColor: c.surface }}>
      <ScreenHeader />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        {/* Greeting */}
        <View className="mb-5">
          <Text className="font-bold text-2xl" style={{ color: c.fg }}>
            {greeting}, {user?.name?.split(" ")[0] ?? profile?.name?.split(" ")[0] ?? "there"}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            {profile && (
              <VerifiedBadge
                passedAssessmentCount={profile.passedAssessmentCount}
                hasSubmissionsUnderReview={hasSubmissionsUnderReview}
              />
            )}
          </View>
        </View>

        {/* Stats Row */}
        <View className="mb-4 flex-row gap-3">
          <View
            className="flex-1 rounded-xl p-3.5"
            style={{ backgroundColor: c.card }}
          >
            <View className="mb-1.5 h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: c.highlightBg }}>
              <Briefcase size={16} strokeWidth={1.5} color={c.primary} />
            </View>
            <Text className="font-bold text-xl" style={{ color: c.fg }}>
              {totalApplications}
            </Text>
            <Text className="font-sans text-xs" style={{ color: c.mutedFg }}>
              Applications
            </Text>
          </View>
          <View
            className="flex-1 rounded-xl p-3.5"
            style={{ backgroundColor: c.card }}
          >
            <View className="mb-1.5 h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: c.highlightBg }}>
              <ClipboardCheck size={16} strokeWidth={1.5} color={c.primary} />
            </View>
            <Text className="font-bold text-xl" style={{ color: c.fg }}>
              {passedAssessments}/{totalAssessments}
            </Text>
            <Text className="font-sans text-xs" style={{ color: c.mutedFg }}>
              Assessments Passed
            </Text>
          </View>
        </View>

        {/* Profile Completion */}
        {profilePercent < 100 && (
          <Pressable
            className="mb-4 rounded-xl p-4"
            style={{ backgroundColor: c.card }}
            onPress={() => router.push("/(app)/profile/edit")}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: c.highlightBg }}>
                  <UserPen size={16} strokeWidth={1.5} color={c.primary} />
                </View>
                <View>
                  <Text className="font-bold text-sm" style={{ color: c.fg }}>
                    Complete Your Profile
                  </Text>
                  <Text className="font-sans text-xs" style={{ color: c.mutedFg }}>
                    {profilePercent}% complete
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} strokeWidth={1.5} color={c.mutedFg} />
            </View>
            {/* Progress bar */}
            <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: c.border }}>
              <View
                className="h-full rounded-full"
                style={{
                  width: `${profilePercent}%`,
                  backgroundColor: c.primary,
                }}
              />
            </View>
            {/* Missing items */}
            <View className="mt-3 flex-row flex-wrap gap-1.5">
              {incompleteTasks.map((task) => (
                <View
                  key={task.label}
                  className="rounded-md px-2.5 py-1"
                  style={{ backgroundColor: c.tag }}
                >
                  <Text className="font-sans text-xs" style={{ color: c.tagText }}>
                    {task.label}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
        )}

        {/* Active Assessments */}
        {activeAssessments.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 font-bold text-base" style={{ color: c.fg }}>
              Continue Assessment
            </Text>
            {activeAssessments.map((sub) => (
              <Pressable
                key={sub.id}
                className="mb-2 rounded-xl p-4"
                style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}
                onPress={() => router.push(`/(app)/assessments/${sub.id}`)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="mr-3 flex-1 flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: c.highlightBg }}>
                      <Target size={18} strokeWidth={1.5} color={c.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-sm" style={{ color: c.fg }}>
                        {sub.assessment.title}
                      </Text>
                      <Text className="mt-0.5 font-sans text-xs" style={{ color: c.mutedFg }}>
                        {sub.assessment.difficulty}
                      </Text>
                    </View>
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

        {/* Quick Actions */}
        <View className="mb-4">
          <Text className="mb-2 font-bold text-base" style={{ color: c.fg }}>
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 items-center rounded-xl py-4"
              style={{ backgroundColor: c.primary }}
              onPress={() => router.push("/(app)/(tabs)/jobs")}
            >
              <Search size={20} strokeWidth={1.5} color={c.primaryFg} />
              <Text className="mt-1.5 font-medium text-sm" style={{ color: c.primaryFg }}>
                Find Jobs
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 items-center rounded-xl py-4"
              style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}
              onPress={() => router.push("/(app)/(tabs)/applications")}
            >
              <FileText size={20} strokeWidth={1.5} color={c.fg} />
              <Text className="mt-1.5 font-medium text-sm" style={{ color: c.fg }}>
                Applications
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 items-center rounded-xl py-4"
              style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}
              onPress={() => router.push("/(app)/profile")}
            >
              <UserPen size={20} strokeWidth={1.5} color={c.fg} />
              <Text className="mt-1.5 font-medium text-sm" style={{ color: c.fg }}>
                Profile
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Applications */}
        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-bold text-base" style={{ color: c.fg }}>
              Recent Applications
            </Text>
            {totalApplications > 3 && (
              <Pressable onPress={() => router.push("/(app)/(tabs)/applications")}>
                <Text className="font-medium text-sm" style={{ color: c.primary }}>
                  See All
                </Text>
              </Pressable>
            )}
          </View>
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
            <Pressable
              className="rounded-xl p-4"
              style={{ backgroundColor: c.card }}
              onPress={() => router.push("/(app)/(tabs)/jobs")}
            >
              <View className="items-center py-2">
                <View className="mb-2 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: c.accent }}>
                  <Sparkles size={18} strokeWidth={1.5} color={c.mutedFg} />
                </View>
                <Text className="font-medium text-sm" style={{ color: c.fg }}>
                  No applications yet
                </Text>
                <Text className="mt-1 font-sans text-xs" style={{ color: c.mutedFg }}>
                  Browse jobs and start applying
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
