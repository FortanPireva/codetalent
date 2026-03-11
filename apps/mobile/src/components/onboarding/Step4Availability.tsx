import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { StepContainer } from "./StepContainer";
import { useThemeColors } from "@/hooks/useThemeColors";
import { AVAILABILITY_OPTIONS, CURRENCY_OPTIONS } from "@/lib/onboarding";
import type { OnboardingFormData } from "@/lib/onboarding";

interface Step4AvailabilityProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Availability({ data, onUpdate, onNext, onBack }: Step4AvailabilityProps) {
  const c = useThemeColors();

  return (
    <StepContainer
      title="Availability & Rates"
      description="Let employers know your availability"
      onNext={onNext}
      onBack={onBack}
    >
      {/* Availability */}
      <Text className="mb-2 font-medium text-sm" style={{ color: c.fg }}>Availability *</Text>
      <View className="mb-6 gap-2">
        {AVAILABILITY_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            className="rounded-xl px-4 py-4"
            style={{
              borderWidth: 1,
              borderColor: data.availability === option.value ? c.primary : c.border,
              backgroundColor: data.availability === option.value ? `${c.primary}0D` : c.inputBg,
            }}
            onPress={() => onUpdate({ availability: option.value })}
          >
            <Text
              className="font-medium text-base"
              style={{
                color: data.availability === option.value ? c.fg : c.mutedFg,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Currency */}
      <Text className="mb-2 font-medium text-sm" style={{ color: c.fg }}>Currency</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2">
          {CURRENCY_OPTIONS.map((cur) => (
            <Pressable
              key={cur}
              className="rounded-lg px-4 py-2"
              style={{
                backgroundColor: data.rateCurrency === cur ? c.primary : c.inputBg,
                borderWidth: data.rateCurrency === cur ? 0 : 1,
                borderColor: c.border,
              }}
              onPress={() => onUpdate({ rateCurrency: cur })}
            >
              <Text
                className="font-medium text-sm"
                style={{
                  color: data.rateCurrency === cur ? c.primaryFg : c.mutedFg,
                }}
              >
                {cur}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Rates */}
      <Text className="mb-1.5 font-medium text-sm" style={{ color: c.fg }}>
        Hourly Rate ({data.rateCurrency})
      </Text>
      <TextInput
        className="mb-4 rounded-xl px-4 py-4 font-sans text-base"
        style={{ backgroundColor: c.inputBg, borderColor: c.border, borderWidth: 1, color: c.fg }}
        placeholder="e.g. 75"
        placeholderTextColor={c.placeholder}
        value={data.hourlyRate}
        onChangeText={(text) => onUpdate({ hourlyRate: text.replace(/[^0-9.]/g, "") })}
        keyboardType="numeric"
      />

      <Text className="mb-1.5 font-medium text-sm" style={{ color: c.fg }}>
        Monthly Rate ({data.rateCurrency})
      </Text>
      <TextInput
        className="mb-4 rounded-xl px-4 py-4 font-sans text-base"
        style={{ backgroundColor: c.inputBg, borderColor: c.border, borderWidth: 1, color: c.fg }}
        placeholder="e.g. 8000"
        placeholderTextColor={c.placeholder}
        value={data.monthlyRate}
        onChangeText={(text) => onUpdate({ monthlyRate: text.replace(/[^0-9.]/g, "") })}
        keyboardType="numeric"
      />
    </StepContainer>
  );
}
