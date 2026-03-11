import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from "expo-secure-store";
import { StepContainer } from "./StepContainer";
import type { OnboardingFormData } from "@/lib/onboarding";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface Step0ResumeProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
}

export function Step0Resume({ data, onUpdate, onNext }: Step0ResumeProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handlePickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert("Error", "File must be less than 5MB");
        return;
      }

      setUploading(true);
      setFileName(file.name);

      const token = await SecureStore.getItemAsync("auth_token");
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: "application/pdf",
        name: file.name,
      } as unknown as Blob);

      const response = await fetch(`${API_URL}/api/upload-resume`, {
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

      const { resumeUrl, parsedProfile } = await response.json();

      const updates: Partial<OnboardingFormData> = { resumeUrl };
      if (parsedProfile) {
        if (parsedProfile.name) updates.name = parsedProfile.name;
        if (parsedProfile.bio) updates.bio = parsedProfile.bio;
        if (parsedProfile.phone) updates.phone = parsedProfile.phone;
        if (parsedProfile.location) updates.location = parsedProfile.location;
        if (parsedProfile.githubUrl) updates.githubUrl = parsedProfile.githubUrl;
        if (parsedProfile.linkedinUrl) updates.linkedinUrl = parsedProfile.linkedinUrl;
        if (Array.isArray(parsedProfile.skills) && parsedProfile.skills.length > 0) {
          updates.skills = parsedProfile.skills;
        }
      }

      onUpdate(updates);
      Alert.alert("Success", "Resume uploaded and profile auto-filled!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload resume";
      Alert.alert("Error", message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <StepContainer
      title="Upload Resume"
      description="Upload your resume to auto-fill your profile. You can skip this step and upload later."
      onNext={onNext}
      isFirst
      nextLabel={data.resumeUrl ? "Continue" : "Skip"}
    >
      <View className="items-center py-8">
        <Pressable
          className={`w-full items-center rounded-xl border-2 border-dashed border-border px-6 py-12 ${uploading ? "opacity-60" : ""}`}
          onPress={handlePickDocument}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <ActivityIndicator size="large" className="mb-3" />
              <Text className="font-medium text-base text-muted-foreground">
                Uploading & parsing...
              </Text>
            </>
          ) : (
            <>
              <Text className="mb-2 text-4xl">📄</Text>
              <Text className="mb-1 font-bold text-base text-foreground">
                Tap to select PDF
              </Text>
              <Text className="font-sans text-sm text-muted-foreground">
                Max 5MB
              </Text>
            </>
          )}
        </Pressable>

        {data.resumeUrl ? (
          <View className="mt-4 flex-row items-center gap-2 rounded-lg bg-surface px-4 py-3">
            <Text className="text-lg">✓</Text>
            <Text className="flex-1 font-medium text-sm text-foreground" numberOfLines={1}>
              {fileName || "Resume uploaded"}
            </Text>
          </View>
        ) : null}
      </View>
    </StepContainer>
  );
}
