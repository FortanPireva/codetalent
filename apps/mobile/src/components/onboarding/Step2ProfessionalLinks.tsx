import { Text, TextInput } from "react-native";
import { StepContainer } from "./StepContainer";
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
  return (
    <StepContainer
      title="Professional Links"
      description="Connect your online profiles"
      onNext={onNext}
      onBack={onBack}
    >
      <Text className="mb-1.5 font-medium text-sm text-foreground">GitHub URL *</Text>
      <TextInput
        className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
        placeholder="https://github.com/username"
        placeholderTextColor="#999"
        value={data.githubUrl}
        onChangeText={(text) => onUpdate({ githubUrl: text })}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <Text className="mb-1.5 font-medium text-sm text-foreground">LinkedIn URL</Text>
      <TextInput
        className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
        placeholder="https://linkedin.com/in/username"
        placeholderTextColor="#999"
        value={data.linkedinUrl}
        onChangeText={(text) => onUpdate({ linkedinUrl: text })}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
    </StepContainer>
  );
}
