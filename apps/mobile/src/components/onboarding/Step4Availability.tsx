import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { StepContainer } from "./StepContainer";
import { AVAILABILITY_OPTIONS, CURRENCY_OPTIONS } from "@/lib/onboarding";
import type { OnboardingFormData } from "@/lib/onboarding";

interface Step4AvailabilityProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Availability({ data, onUpdate, onNext, onBack }: Step4AvailabilityProps) {
  return (
    <StepContainer
      title="Availability & Rates"
      description="Let employers know your availability"
      onNext={onNext}
      onBack={onBack}
    >
      {/* Availability */}
      <Text className="mb-2 font-medium text-sm text-foreground">Availability *</Text>
      <View className="mb-6 gap-2">
        {AVAILABILITY_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            className={`rounded-xl border px-4 py-4 ${
              data.availability === option.value
                ? "border-primary bg-primary/5"
                : "border-border bg-input-bg"
            }`}
            onPress={() => onUpdate({ availability: option.value })}
          >
            <Text
              className={`font-medium text-base ${
                data.availability === option.value
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Currency */}
      <Text className="mb-2 font-medium text-sm text-foreground">Currency</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2">
          {CURRENCY_OPTIONS.map((cur) => (
            <Pressable
              key={cur}
              className={`rounded-lg px-4 py-2 ${
                data.rateCurrency === cur
                  ? "bg-primary"
                  : "border border-border bg-input-bg"
              }`}
              onPress={() => onUpdate({ rateCurrency: cur })}
            >
              <Text
                className={`font-medium text-sm ${
                  data.rateCurrency === cur
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {cur}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Rates */}
      <Text className="mb-1.5 font-medium text-sm text-foreground">
        Hourly Rate ({data.rateCurrency})
      </Text>
      <TextInput
        className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
        placeholder="e.g. 75"
        placeholderTextColor="#999"
        value={data.hourlyRate}
        onChangeText={(text) => onUpdate({ hourlyRate: text.replace(/[^0-9.]/g, "") })}
        keyboardType="numeric"
      />

      <Text className="mb-1.5 font-medium text-sm text-foreground">
        Monthly Rate ({data.rateCurrency})
      </Text>
      <TextInput
        className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
        placeholder="e.g. 8000"
        placeholderTextColor="#999"
        value={data.monthlyRate}
        onChangeText={(text) => onUpdate({ monthlyRate: text.replace(/[^0-9.]/g, "") })}
        keyboardType="numeric"
      />
    </StepContainer>
  );
}
