import { Text, TextInput } from "react-native";
import { StepContainer } from "./StepContainer";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { OnboardingFormData } from "@/lib/onboarding";

interface Step2ProfessionalLinksProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2ProfessionalLinks({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step2ProfessionalLinksProps) {
  const c = useThemeColors();

  return (
    <StepContainer
      title="Professional Links"
      description="Connect your online profiles"
      onNext={onNext}
      onBack={onBack}
    >
      <Text className="mb-1.5 font-medium text-sm" style={{ color: c.fg }}>GitHub URL *</Text>
      <TextInput
        className="mb-4 rounded-xl px-4 py-4 font-sans text-base"
        style={{ backgroundColor: c.inputBg, borderColor: c.border, borderWidth: 1, color: c.fg }}
        placeholder="https://github.com/username"
        placeholderTextColor={c.placeholder}
        value={data.githubUrl}
        onChangeText={(text) => onUpdate({ githubUrl: text })}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <Text className="mb-1.5 font-medium text-sm" style={{ color: c.fg }}>LinkedIn URL</Text>
      <TextInput
        className="mb-4 rounded-xl px-4 py-4 font-sans text-base"
        style={{ backgroundColor: c.inputBg, borderColor: c.border, borderWidth: 1, color: c.fg }}
        placeholder="https://linkedin.com/in/username"
        placeholderTextColor={c.placeholder}
        value={data.linkedinUrl}
        onChangeText={(text) => onUpdate({ linkedinUrl: text })}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
    </StepContainer>
  );
}
