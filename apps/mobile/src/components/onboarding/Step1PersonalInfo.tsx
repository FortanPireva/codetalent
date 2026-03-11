import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from "expo-secure-store";
import { StepContainer } from "./StepContainer";
import type { OnboardingFormData } from "@/lib/onboarding";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface Step1PersonalInfoProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step1PersonalInfo({ data, onUpdate, onNext, onBack }: Step1PersonalInfoProps) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

      const token = await SecureStore.getItemAsync("auth_token");
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: file.mimeType || "image/jpeg",
        name: file.name,
      } as unknown as Blob);
      formData.append("type", "avatar");

      const response = await fetch(`${API_URL}/api/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await response.json();
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
        <View className="mb-2 h-20 w-20 items-center justify-center rounded-full bg-primary">
          {uploadingAvatar ? (
            <ActivityIndicator color="white" />
          ) : data.profilePicture ? (
            <Text className="font-bold text-2xl text-primary-foreground">✓</Text>
          ) : (
            <Text className="font-bold text-2xl text-primary-foreground">
              {data.name?.charAt(0)?.toUpperCase() || "+"}
            </Text>
          )}
        </View>
        <Text className="font-sans text-sm text-muted-foreground">
          {data.profilePicture ? "Change photo" : "Add photo"}
        </Text>
      </Pressable>

      {/* Name */}
      <Text className="mb-1.5 font-medium text-sm text-foreground">Full Name *</Text>
      <TextInput
        className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
        placeholder="John Doe"
        placeholderTextColor="#999"
        value={data.name}
        onChangeText={(text) => onUpdate({ name: text })}
        autoComplete="name"
      />

      {/* Bio */}
      <View className="mb-4">
        <View className="mb-1.5 flex-row items-center justify-between">
          <Text className="font-medium text-sm text-foreground">Bio *</Text>
          <Text className={`font-sans text-xs ${data.bio.length > 500 ? "text-destructive" : "text-muted-foreground"}`}>
            {data.bio.length}/500
          </Text>
        </View>
        <TextInput
          className="rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
          placeholder="Brief professional summary..."
          placeholderTextColor="#999"
          value={data.bio}
          onChangeText={(text) => onUpdate({ bio: text.slice(0, 500) })}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: "top" }}
        />
      </View>

      {/* Phone */}
      <Text className="mb-1.5 font-medium text-sm text-foreground">Phone *</Text>
      <TextInput
        className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
        placeholder="+1 234 567 8900"
        placeholderTextColor="#999"
        value={data.phone}
        onChangeText={(text) => onUpdate({ phone: text })}
        keyboardType="phone-pad"
        autoComplete="tel"
      />

      {/* Location */}
      <Text className="mb-1.5 font-medium text-sm text-foreground">Location *</Text>
      <TextInput
        className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
        placeholder="San Francisco, CA"
        placeholderTextColor="#999"
        value={data.location}
        onChangeText={(text) => onUpdate({ location: text })}
      />
    </StepContainer>
  );
}
