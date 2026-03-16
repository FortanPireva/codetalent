import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { CheckCircle, Clock, ClipboardList } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/trpc";
import { useThemeColors } from "@/hooks/useThemeColors";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { ScoreBreakdown } from "@/components/profile/ScoreBreakdown";

const AVAILABILITY_LABELS: Record<string, string> = {
  ACTIVELY_LOOKING: "Actively Looking",
  OPEN_TO_OFFERS: "Open to Offers",
  NOT_LOOKING: "Not Looking",
  HIRED: "Hired",
};

export default function ProfileViewScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const {
    data: profile,
    isLoading: profileLoading,
    refetch,
    isRefetching,
  } = api.auth.getProfile.useQuery();

  const { data: submissions } = api.assessment.mySubmissions.useQuery(
    undefined,
    { enabled: !!profile },
  );

  if (profileLoading) {
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
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: c.surface }}
      contentContainerClassName="p-4 pb-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Header */}
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
              <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
                Hourly Rate
              </Text>
              <Text className="font-medium text-sm" style={{ color: c.fg }}>
                {profile.rateCurrency ?? "USD"} {profile.hourlyRate}/hr
              </Text>
            </View>
          )}
          {profile.monthlyRate != null && (
            <View className="flex-row justify-between py-2">
              <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
                Monthly Rate
              </Text>
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
              <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
                GitHub
              </Text>
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
              <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
                LinkedIn
              </Text>
              <Text className="font-medium text-sm" style={{ color: c.primary }}>
                {profile.linkedinUrl.replace("https://", "")}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Codeks Verified Badge */}
      <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Codeks Verified Badge
        </Text>
        {profile.passedAssessmentCount >= 1 ? (
          <View className="flex-row items-center gap-2">
            <CheckCircle size={20} strokeWidth={1.5} color={c.highlight} />
            <Text className="font-sans text-sm" style={{ color: c.fg }}>
              Verified — {profile.passedAssessmentCount} assessment
              {profile.passedAssessmentCount > 1 ? "s" : ""} passed
            </Text>
          </View>
        ) : hasSubmissionsUnderReview ? (
          <View className="flex-row items-center gap-2">
            <Clock size={20} strokeWidth={1.5} color={c.mutedFg} />
            <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
              Your assessment is being reviewed
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-2">
            <ClipboardList size={20} strokeWidth={1.5} color={c.mutedFg} />
            <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
              Complete an assessment to earn your badge
            </Text>
          </View>
        )}
      </View>

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
    </ScrollView>
  );
}
