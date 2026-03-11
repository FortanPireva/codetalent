import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from "expo-secure-store";
import { StepContainer } from "./StepContainer";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { OnboardingFormData } from "@/lib/onboarding";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface Step5ResumeProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step5Resume({ data, onUpdate, onNext, onBack }: Step5ResumeProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const c = useThemeColors();

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

      const { resumeUrl } = await response.json();
      onUpdate({ resumeUrl });
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
      description="Upload your resume to complete your profile"
      onNext={onNext}
      onBack={onBack}
    >
      <View className="items-center py-8">
        <Pressable
          className={`w-full items-center rounded-xl px-6 py-12 ${uploading ? "opacity-60" : ""}`}
          style={{ borderWidth: 2, borderStyle: "dashed", borderColor: c.border }}
          onPress={handlePickDocument}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <ActivityIndicator size="large" className="mb-3" color={c.primary} />
              <Text className="font-medium text-base" style={{ color: c.mutedFg }}>
                Uploading...
              </Text>
            </>
          ) : (
            <>
              <Text className="mb-2 text-4xl">📄</Text>
              <Text className="mb-1 font-bold text-base" style={{ color: c.fg }}>
                Tap to select PDF
              </Text>
              <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
                Max 5MB
              </Text>
            </>
          )}
        </Pressable>

        {data.resumeUrl ? (
          <View
            className="mt-4 flex-row items-center gap-2 rounded-lg px-4 py-3"
            style={{ backgroundColor: c.surface }}
          >
            <Text className="text-lg">✓</Text>
            <Text className="flex-1 font-medium text-sm" style={{ color: c.fg }} numberOfLines={1}>
              {fileName || "Resume uploaded"}
            </Text>
          </View>
        ) : null}
      </View>
    </StepContainer>
  );
}
