import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { api } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { data: profile, isLoading, refetch, isRefetching } =
    api.auth.getProfile.useQuery();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="font-sans text-foreground">Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Header */}
      <View className="mb-6 items-center">
        <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-primary">
          <Text className="font-bold text-3xl text-primary-foreground">
            {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text className="font-bold text-xl text-foreground">{profile.name}</Text>
        <Text className="mt-1 font-sans text-sm text-muted-foreground">
          {profile.email}
        </Text>
      </View>

      {/* Details */}
      <View className="mb-3 rounded-xl bg-card p-4">
        <Text className="mb-3 font-bold text-base text-foreground">Details</Text>
        <InfoRow label="Availability" value={profile.availability} />
        {profile.location && <InfoRow label="Location" value={profile.location} />}
        {profile.phone && <InfoRow label="Phone" value={profile.phone} />}
        <InfoRow
          label="Assessments Passed"
          value={String(profile.passedAssessmentCount)}
        />
      </View>

      {/* Skills */}
      {profile.skills.length > 0 && (
        <View className="mb-3 rounded-xl bg-card p-4">
          <Text className="mb-3 font-bold text-base text-foreground">Skills</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <View key={skill} className="rounded-md bg-tag px-2.5 py-1.5">
                <Text className="font-medium text-xs text-muted-foreground">
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bio */}
      {profile.bio && (
        <View className="mb-3 rounded-xl bg-card p-4">
          <Text className="mb-3 font-bold text-base text-foreground">Bio</Text>
          <Text className="font-sans text-sm text-muted-foreground leading-5">
            {profile.bio}
          </Text>
        </View>
      )}

      {/* Logout */}
      <Pressable
        className="mb-8 mt-2 items-center rounded-xl bg-destructive/10 py-4"
        onPress={logout}
      >
        <Text className="font-medium text-base text-destructive">Sign Out</Text>
      </Pressable>
    </ScrollView>
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
