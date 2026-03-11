import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { StepContainer } from "./StepContainer";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { OnboardingFormData } from "@/lib/onboarding";

interface Step3SkillsProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Skills({ data, onUpdate, onNext, onBack }: Step3SkillsProps) {
  const [input, setInput] = useState("");
  const c = useThemeColors();

  function addSkill() {
    const skill = input.trim();
    if (!skill) return;
    if (data.skills.includes(skill)) {
      setInput("");
      return;
    }
    onUpdate({ skills: [...data.skills, skill] });
    setInput("");
  }

  function removeSkill(skill: string) {
    onUpdate({ skills: data.skills.filter((s) => s !== skill) });
  }

  return (
    <StepContainer
      title="Skills"
      description="What technologies do you work with?"
      onNext={onNext}
      onBack={onBack}
    >
      <View className="mb-4 flex-row gap-2">
        <TextInput
          className="flex-1 rounded-xl px-4 py-4 font-sans text-base"
          style={{ backgroundColor: c.inputBg, borderColor: c.border, borderWidth: 1, color: c.fg }}
          placeholder="e.g. React, TypeScript"
          placeholderTextColor={c.placeholder}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addSkill}
          returnKeyType="done"
        />
        <Pressable
          className="items-center justify-center rounded-xl px-5"
          style={{ backgroundColor: c.primary }}
          onPress={addSkill}
        >
          <Text className="font-bold text-base" style={{ color: c.primaryFg }}>+</Text>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {data.skills.map((skill) => (
          <Pressable
            key={skill}
            className="flex-row items-center gap-1.5 rounded-lg px-3 py-2"
            style={{ backgroundColor: c.surface }}
            onPress={() => removeSkill(skill)}
          >
            <Text className="font-medium text-sm" style={{ color: c.fg }}>{skill}</Text>
            <Text className="font-sans text-xs" style={{ color: c.mutedFg }}>✕</Text>
          </Pressable>
        ))}
      </View>

      {data.skills.length === 0 && (
        <Text className="mt-4 text-center font-sans text-sm" style={{ color: c.mutedFg }}>
          Add at least one skill to continue
        </Text>
      )}
    </StepContainer>
  );
}
