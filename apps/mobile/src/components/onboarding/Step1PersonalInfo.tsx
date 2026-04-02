import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { StepContainer } from "./StepContainer";
import { useThemeColors } from "@/hooks/useThemeColors";
import { uploadFile } from "@/lib/upload";
import type { OnboardingFormData } from "@/lib/onboarding";

interface Step1PersonalInfoProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step1PersonalInfo({ data, onUpdate, onNext, onBack }: Step1PersonalInfoProps) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const c = useThemeColors();

  async function handleAvatarUpload() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/webp"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      if (file.size && file.size > 2 * 1024 * 1024) {
        Alert.alert("Error", "Image must be less than 2MB");
        return;
      }

      setUploadingAvatar(true);

      const { url } = await uploadFile<{ url: string }>({
        endpoint: "/api/upload-image",
        file: {
          uri: file.uri,
          type: file.mimeType || "image/jpeg",
          name: file.name,
        },
        extraFields: { type: "avatar" },
      });
      onUpdate({ profilePicture: url });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      Alert.alert("Error", message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <StepContainer
      title="Personal Info"
      description="Tell us about yourself"
      onNext={onNext}
      onBack={onBack}
    >
      {/* Avatar */}
      <Pressable
        className="mb-6 items-center self-center"
        onPress={handleAvatarUpload}
        disabled={uploadingAvatar}
      >
        <View
          className="mb-2 h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: c.primary }}
        >
          {uploadingAvatar ? (
            <ActivityIndicator color={c.primaryFg} />
          ) : data.profilePicture ? (
            <Text className="font-bold text-2xl" style={{ color: c.primaryFg }}>✓</Text>
          ) : (
            <Text className="font-bold text-2xl" style={{ color: c.primaryFg }}>
              {data.name?.charAt(0)?.toUpperCase() || "+"}
            </Text>
          )}
        </View>
        <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
          {data.profilePicture ? "Change photo" : "Add photo"}
        </Text>
      </Pressable>

      {/* Name */}
      <Text className="mb-1.5 font-medium text-sm" style={{ color: c.fg }}>Full Name *</Text>
      <TextInput
        className="mb-4 rounded-xl px-4 py-4 font-sans text-base"
        style={{ backgroundColor: c.inputBg, borderColor: c.border, borderWidth: 1, color: c.fg }}
        placeholder="John Doe"
        placeholderTextColor={c.placeholder}
        value={data.name}
        onChangeText={(text) => onUpdate({ name: text })}
        autoComplete="name"
      />

      {/* Bio */}
      <View className="mb-4">
        <View className="mb-1.5 flex-row items-center justify-between">
          <Text className="font-medium text-sm" style={{ color: c.fg }}>Bio *</Text>
          <Text
            className="font-sans text-xs"
            style={{ color: data.bio.length > 500 ? c.destructive : c.mutedFg }}
          >
            {data.bio.length}/500
          </Text>
        </View>
        <TextInput
          className="rounded-xl px-4 py-4 font-sans text-base"
          style={{
            backgroundColor: c.inputBg,
            borderColor: c.border,
            borderWidth: 1,
            color: c.fg,
            minHeight: 100,
            textAlignVertical: "top",
          }}
          placeholder="Brief professional summary..."
          placeholderTextColor={c.placeholder}
          value={data.bio}
          onChangeText={(text) => onUpdate({ bio: text.slice(0, 500) })}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Phone */}
      <Text className="mb-1.5 font-medium text-sm" style={{ color: c.fg }}>Phone *</Text>
      <TextInput
        className="mb-4 rounded-xl px-4 py-4 font-sans text-base"
        style={{ backgroundColor: c.inputBg, borderColor: c.border, borderWidth: 1, color: c.fg }}
        placeholder="+1 234 567 8900"
        placeholderTextColor={c.placeholder}
        value={data.phone}
        onChangeText={(text) => onUpdate({ phone: text })}
        keyboardType="phone-pad"
        autoComplete="tel"
      />

      {/* Location */}
      <Text className="mb-1.5 font-medium text-sm" style={{ color: c.fg }}>Location *</Text>
      <TextInput
        className="mb-4 rounded-xl px-4 py-4 font-sans text-base"
        style={{ backgroundColor: c.inputBg, borderColor: c.border, borderWidth: 1, color: c.fg }}
        placeholder="San Francisco, CA"
        placeholderTextColor={c.placeholder}
        value={data.location}
        onChangeText={(text) => onUpdate({ location: text })}
      />
    </StepContainer>
  );
}
