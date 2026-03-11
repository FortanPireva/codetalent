import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/trpc";
import { useThemeColors } from "@/hooks/useThemeColors";
import { SkillsEditor } from "@/components/profile/SkillsEditor";
import {
  AVAILABILITY_OPTIONS,
  CURRENCY_OPTIONS,
} from "@/lib/onboarding";

export default function ProfileEditScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const utils = api.useUtils();
  const { data: profile, isLoading } = api.auth.getProfile.useQuery();
  const updateProfile = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.getProfile.invalidate();
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState("ACTIVELY_LOOKING");
  const [hourlyRate, setHourlyRate] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [rateCurrency, setRateCurrency] = useState("USD");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? "");
      setSkills(profile.skills ?? []);
      setAvailability(profile.availability ?? "ACTIVELY_LOOKING");
      setHourlyRate(profile.hourlyRate?.toString() ?? "");
      setMonthlyRate(profile.monthlyRate?.toString() ?? "");
      setRateCurrency(profile.rateCurrency ?? "USD");
      setGithubUrl(profile.githubUrl ?? "");
      setLinkedinUrl(profile.linkedinUrl ?? "");
    }
  }, [profile]);

  function handleSave() {
    updateProfile.mutate({
      bio,
      skills,
      availability: availability as any,
      hourlyRate: hourlyRate ? Number(hourlyRate) : null,
      monthlyRate: monthlyRate ? Number(monthlyRate) : null,
      githubUrl: githubUrl || "",
      linkedinUrl: linkedinUrl || "",
    });
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.surface }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: c.surface }}
        contentContainerClassName="p-4 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Bio */}
        <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.card }}>
          <Text className="mb-2 font-bold text-base" style={{ color: c.fg }}>Bio</Text>
          <TextInput
            className="rounded-xl px-4 py-3 font-sans text-base"
            style={{
              backgroundColor: c.inputBg,
              borderColor: c.border,
              borderWidth: 1,
              color: c.fg,
              minHeight: 100,
            }}
            placeholder="Tell us about yourself..."
            placeholderTextColor={c.placeholder}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Skills */}
        <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.card }}>
          <Text className="mb-2 font-bold text-base" style={{ color: c.fg }}>Skills</Text>
          <SkillsEditor skills={skills} onSkillsChange={setSkills} />
        </View>

        {/* Availability */}
        <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.card }}>
          <Text className="mb-2 font-bold text-base" style={{ color: c.fg }}>
            Availability
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {AVAILABILITY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                className="rounded-lg px-3 py-2"
                style={{
                  backgroundColor: availability === option.value ? c.primary : c.surface,
                }}
                onPress={() => setAvailability(option.value)}
              >
                <Text
                  className="font-medium text-sm"
                  style={{
                    color: availability === option.value ? c.primaryFg : c.mutedFg,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Rates */}
        <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.card }}>
          <Text className="mb-2 font-bold text-base" style={{ color: c.fg }}>Rates</Text>

          {/* Currency */}
          <Text className="mb-1.5 font-sans text-sm" style={{ color: c.mutedFg }}>
            Currency
          </Text>
          <View className="mb-3 flex-row flex-wrap gap-2">
            {CURRENCY_OPTIONS.map((currency) => (
              <Pressable
                key={currency}
                className="rounded-lg px-3 py-2"
                style={{
                  backgroundColor: rateCurrency === currency ? c.primary : c.surface,
                }}
                onPress={() => setRateCurrency(currency)}
              >
                <Text
                  className="font-medium text-sm"
                  style={{
                    color: rateCurrency === currency ? c.primaryFg : c.mutedFg,
                  }}
                >
                  {currency}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="mb-1.5 font-sans text-sm" style={{ color: c.mutedFg }}>
            Hourly Rate
          </Text>
          <TextInput
            className="mb-3 rounded-xl px-4 py-3 font-sans text-base"
            style={{
              backgroundColor: c.inputBg,
              borderColor: c.border,
              borderWidth: 1,
              color: c.fg,
            }}
            placeholder="e.g. 50"
            placeholderTextColor={c.placeholder}
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
          />

          <Text className="mb-1.5 font-sans text-sm" style={{ color: c.mutedFg }}>
            Monthly Rate
          </Text>
          <TextInput
            className="rounded-xl px-4 py-3 font-sans text-base"
            style={{
              backgroundColor: c.inputBg,
              borderColor: c.border,
              borderWidth: 1,
              color: c.fg,
            }}
            placeholder="e.g. 5000"
            placeholderTextColor={c.placeholder}
            value={monthlyRate}
            onChangeText={setMonthlyRate}
            keyboardType="numeric"
          />
        </View>

        {/* Links */}
        <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.card }}>
          <Text className="mb-2 font-bold text-base" style={{ color: c.fg }}>Links</Text>

          <Text className="mb-1.5 font-sans text-sm" style={{ color: c.mutedFg }}>
            GitHub URL
          </Text>
          <TextInput
            className="mb-3 rounded-xl px-4 py-3 font-sans text-base"
            style={{
              backgroundColor: c.inputBg,
              borderColor: c.border,
              borderWidth: 1,
              color: c.fg,
            }}
            placeholder="https://github.com/username"
            placeholderTextColor={c.placeholder}
            value={githubUrl}
            onChangeText={setGithubUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <Text className="mb-1.5 font-sans text-sm" style={{ color: c.mutedFg }}>
            LinkedIn URL
          </Text>
          <TextInput
            className="rounded-xl px-4 py-3 font-sans text-base"
            style={{
              backgroundColor: c.inputBg,
              borderColor: c.border,
              borderWidth: 1,
              color: c.fg,
            }}
            placeholder="https://linkedin.com/in/username"
            placeholderTextColor={c.placeholder}
            value={linkedinUrl}
            onChangeText={setLinkedinUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Save Button */}
        <Pressable
          className="items-center rounded-xl py-4"
          style={{
            backgroundColor: updateProfile.isLoading ? `${c.primary}80` : c.primary,
          }}
          onPress={handleSave}
          disabled={updateProfile.isLoading}
        >
          {updateProfile.isLoading ? (
            <ActivityIndicator color={c.primaryFg} />
          ) : (
            <Text className="font-bold text-base" style={{ color: c.primaryFg }}>
              Save Changes
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
