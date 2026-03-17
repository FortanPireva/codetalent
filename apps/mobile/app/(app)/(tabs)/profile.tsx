import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from "react-native";
import { Settings, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { ScoreBreakdown } from "@/components/profile/ScoreBreakdown";

const AVAILABILITY_LABELS: Record<string, string> = {
  ACTIVELY_LOOKING: "Actively Looking",
  OPEN_TO_OFFERS: "Open to Offers",
  NOT_LOOKING: "Not Looking",
  HIRED: "Hired",
};

const NOTIFICATION_KEYS = {
  assessmentResults: "notif_assessment_results",
  newJobMatches: "notif_new_job_matches",
  applicationUpdates: "notif_application_updates",
} as const;

type NotifKey = keyof typeof NOTIFICATION_KEYS;

export default function ProfileTabScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const c = useThemeColors();

  const {
    data: profile,
    isLoading,
    refetch,
    isRefetching,
  } = api.auth.getProfile.useQuery();

  const { data: submissions } = api.assessment.mySubmissions.useQuery(
    undefined,
    { enabled: !!profile },
  );

  // Notification preferences
  const [notifications, setNotifications] = useState({
    assessmentResults: true,
    newJobMatches: true,
    applicationUpdates: true,
  });

  const deleteAccountMutation = api.auth.deleteAccount.useMutation();
  const { data: blockedUsers, refetch: refetchBlocked } = api.moderation.getBlockedUsers.useQuery();
  const unblockMutation = api.moderation.unblockUser.useMutation({
    onSuccess: () => refetchBlocked(),
  });

  const { data: serverPrefs } = api.notification.getPreferences.useQuery(undefined, {
    staleTime: 30_000,
  });
  const updatePrefsMutation = api.notification.updatePreferences.useMutation();

  useEffect(() => {
    if (serverPrefs) {
      const synced = {
        assessmentResults: serverPrefs.assessmentResults,
        newJobMatches: serverPrefs.newJobMatches,
        applicationUpdates: serverPrefs.applicationUpdates,
      };
      setNotifications(synced);
      for (const [key, storageKey] of Object.entries(NOTIFICATION_KEYS)) {
        AsyncStorage.setItem(storageKey, String(synced[key as NotifKey]));
      }
    } else {
      loadNotificationPrefs();
    }
  }, [serverPrefs]);

  async function loadNotificationPrefs() {
    for (const [key, storageKey] of Object.entries(NOTIFICATION_KEYS)) {
      const value = await AsyncStorage.getItem(storageKey);
      if (value !== null) {
        setNotifications((prev) => ({ ...prev, [key]: value === "true" }));
      }
    }
  }

  async function toggleNotification(key: NotifKey) {
    const newValue = !notifications[key];
    setNotifications((prev) => ({ ...prev, [key]: newValue }));
    await AsyncStorage.setItem(NOTIFICATION_KEYS[key], String(newValue));
    updatePrefsMutation.mutate({ [key]: newValue });
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.surface }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.surface }}>
        <Text className="font-sans" style={{ color: c.fg }}>Profile not found</Text>
      </View>
    );
  }

  const hasSubmissionsUnderReview =
    submissions?.some(
      (s) => s.status === "UNDER_REVIEW" || s.status === "SUBMITTED",
    ) ?? false;

  const passedWithReview = submissions?.filter(
    (s) => s.status === "PASSED" && s.review,
  );
  const bestReview = passedWithReview?.[0]?.review;

  return (
    <View className="flex-1" style={{ backgroundColor: c.surface }}>
    <ScreenHeader />
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-4"
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Profile Header */}
      <View className="mb-5 items-center">
        <View
          className="mb-3 h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: c.primary }}
        >
          <Text className="font-bold text-4xl" style={{ color: c.primaryFg }}>
            {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text className="font-bold text-xl" style={{ color: c.fg }}>{profile.name}</Text>
        <View className="mt-2">
          <VerifiedBadge
            passedAssessmentCount={profile.passedAssessmentCount}
            hasSubmissionsUnderReview={hasSubmissionsUnderReview}
          />
        </View>
        {(profile.location || profile.availability) && (
          <View className="mt-2 flex-row items-center gap-2">
            {profile.location && (
              <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
                {profile.location}
              </Text>
            )}
            {profile.location && profile.availability && (
              <Text style={{ color: c.mutedFg }}>·</Text>
            )}
            {profile.availability && (
              <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${c.primary}1A` }}>
                <Text className="font-medium text-xs" style={{ color: c.primary }}>
                  {AVAILABILITY_LABELS[profile.availability] ?? profile.availability}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* About */}
      <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-bold text-base" style={{ color: c.fg }}>About</Text>
          <Pressable onPress={() => router.push("/(app)/profile/edit")}>
            <Text className="font-medium text-sm" style={{ color: c.primary }}>Edit</Text>
          </Pressable>
        </View>
        {profile.bio ? (
          <Text className="font-sans text-sm leading-5" style={{ color: c.mutedFg }}>
            {profile.bio}
          </Text>
        ) : (
          <Text className="font-sans text-sm italic" style={{ color: c.mutedFg }}>
            No bio added yet
          </Text>
        )}
      </View>

      {/* Skills */}
      <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>Skills</Text>
        {profile.skills.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <View key={skill} className="rounded-md px-2.5 py-1.5" style={{ backgroundColor: c.tag }}>
                <Text className="font-medium text-xs" style={{ color: c.mutedFg }}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="font-sans text-sm italic" style={{ color: c.mutedFg }}>
            No skills added yet
          </Text>
        )}
      </View>

      {/* Rates */}
      {(profile.hourlyRate || profile.monthlyRate) && (
        <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
          <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>Rates</Text>
          {profile.hourlyRate != null && (
            <View className="flex-row justify-between py-2" style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight }}>
              <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>Hourly Rate</Text>
              <Text className="font-medium text-sm" style={{ color: c.fg }}>
                {profile.rateCurrency ?? "USD"} {profile.hourlyRate}/hr
              </Text>
            </View>
          )}
          {profile.monthlyRate != null && (
            <View className="flex-row justify-between py-2">
              <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>Monthly Rate</Text>
              <Text className="font-medium text-sm" style={{ color: c.fg }}>
                {profile.rateCurrency ?? "USD"} {profile.monthlyRate}/mo
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Links */}
      {(profile.githubUrl || profile.linkedinUrl) && (
        <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
          <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>Links</Text>
          {profile.githubUrl && (
            <Pressable
              className="flex-row justify-between py-2"
              style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight }}
              onPress={() => Linking.openURL(profile.githubUrl!)}
            >
              <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>GitHub</Text>
              <Text className="font-medium text-sm" style={{ color: c.primary }}>
                {profile.githubUrl.replace("https://", "")}
              </Text>
            </Pressable>
          )}
          {profile.linkedinUrl && (
            <Pressable
              className="flex-row justify-between py-2"
              onPress={() => Linking.openURL(profile.linkedinUrl!)}
            >
              <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>LinkedIn</Text>
              <Text className="font-medium text-sm" style={{ color: c.primary }}>
                {profile.linkedinUrl.replace("https://", "")}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Assessment Scores */}
      {bestReview && "codeQuality" in bestReview && (
        <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
          <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
            Assessment Scores
          </Text>
          <ScoreBreakdown
            scores={{
              codeQuality: (bestReview as any).codeQuality,
              architecture: (bestReview as any).architecture,
              typeSafety: (bestReview as any).typeSafety,
              errorHandling: (bestReview as any).errorHandling,
              testing: (bestReview as any).testing,
              gitPractices: (bestReview as any).gitPractices,
              documentation: (bestReview as any).documentation,
              bestPractices: (bestReview as any).bestPractices,
            }}
          />
        </View>
      )}

      {/* Settings Divider */}
      <View className="mb-3 mt-4 flex-row items-center gap-2 px-1">
        <Settings size={18} strokeWidth={1.5} color={c.mutedFg} />
        <Text className="font-bold text-base" style={{ color: c.fg }}>Settings</Text>
      </View>

      {/* Notifications */}
      <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Notifications
        </Text>
        <NotificationToggle
          label="Assessment Results"
          value={notifications.assessmentResults}
          onToggle={() => toggleNotification("assessmentResults")}
          colors={c}
        />
        <NotificationToggle
          label="New Job Matches"
          value={notifications.newJobMatches}
          onToggle={() => toggleNotification("newJobMatches")}
          colors={c}
        />
        <NotificationToggle
          label="Application Updates"
          value={notifications.applicationUpdates}
          onToggle={() => toggleNotification("applicationUpdates")}
          colors={c}
          isLast
        />
      </View>

      {/* Appearance */}
      <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Appearance
        </Text>
        <View className="flex-row gap-2">
          {(["light", "dark", "system"] as const).map((option) => (
            <Pressable
              key={option}
              className="flex-1 items-center rounded-lg py-2.5"
              style={{
                backgroundColor: theme === option ? c.primary : c.surface,
              }}
              onPress={() => setTheme(option)}
            >
              <Text
                className="font-medium text-sm capitalize"
                style={{
                  color: theme === option ? c.primaryFg : c.mutedFg,
                }}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Legal */}
      <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Legal
        </Text>
        <Pressable
          className="flex-row items-center justify-between py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight }}
          onPress={() => Linking.openURL("https://talentflow.codeks.net/terms")}
        >
          <Text className="font-sans text-sm" style={{ color: c.fg }}>Terms of Service</Text>
          <ChevronRight size={16} color={c.mutedFg} />
        </Pressable>
        <Pressable
          className="flex-row items-center justify-between py-3"
          onPress={() => Linking.openURL("https://talentflow.codeks.net/privacy")}
        >
          <Text className="font-sans text-sm" style={{ color: c.fg }}>Privacy Policy</Text>
          <ChevronRight size={16} color={c.mutedFg} />
        </Pressable>
      </View>

      {/* Blocked Users */}
      <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Blocked Users
        </Text>
        {blockedUsers && blockedUsers.length > 0 ? (
          blockedUsers.map((blocked) => (
            <View
              key={blocked.id}
              className="flex-row items-center justify-between py-2.5"
              style={{ borderBottomWidth: 1, borderBottomColor: c.borderLight }}
            >
              <View className="flex-row items-center gap-2">
                <View
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: c.primary }}
                >
                  <Text className="font-bold text-xs" style={{ color: c.primaryFg }}>
                    {blocked.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </Text>
                </View>
                <Text className="font-sans text-sm" style={{ color: c.fg }}>
                  {blocked.name ?? "Unknown"}
                </Text>
              </View>
              <Pressable
                className="rounded-lg px-3 py-1.5"
                style={{ backgroundColor: c.surface }}
                onPress={() => {
                  Alert.alert(
                    "Unblock User",
                    `Are you sure you want to unblock ${blocked.name ?? "this user"}?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Unblock",
                        onPress: () => unblockMutation.mutate({ blockedUserId: blocked.id }),
                      },
                    ],
                  );
                }}
              >
                <Text className="font-medium text-xs" style={{ color: c.destructive }}>Unblock</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
            No blocked users
          </Text>
        )}
      </View>

      {/* Account */}
      <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Account
        </Text>
        <Pressable
          className="mb-3 items-center rounded-xl py-3.5"
          style={{ backgroundColor: `${c.destructive}1A` }}
          onPress={logout}
        >
          <Text className="font-medium text-base" style={{ color: c.destructive }}>
            Sign Out
          </Text>
        </Pressable>
        <Pressable
          className="items-center rounded-xl py-3.5"
          style={{ backgroundColor: c.destructive }}
          onPress={() => {
            Alert.alert(
              "Delete Account",
              "This will permanently delete your account and all data. This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccountMutation.mutateAsync();
                      await logout();
                    } catch {
                      Alert.alert("Error", "Failed to delete account. Please try again.");
                    }
                  },
                },
              ],
            );
          }}
        >
          <Text className="font-medium text-base" style={{ color: "#FFFFFF" }}>
            Delete Account
          </Text>
        </Pressable>
      </View>
    </ScrollView>
    </View>
  );
}

function NotificationToggle({
  label,
  value,
  onToggle,
  isLast,
  colors: c,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  isLast?: boolean;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between py-3"
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: c.borderLight } : undefined}
      onPress={onToggle}
    >
      <Text className="font-sans text-sm" style={{ color: c.fg }}>{label}</Text>
      <View
        className="h-7 w-12 justify-center rounded-full px-0.5"
        style={{ backgroundColor: value ? c.primary : c.toggleOff }}
      >
        <View
          className={`h-6 w-6 rounded-full bg-white shadow ${
            value ? "self-end" : "self-start"
          }`}
        />
      </View>
    </Pressable>
  );
}
