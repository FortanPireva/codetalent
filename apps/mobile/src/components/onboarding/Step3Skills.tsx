import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { StepContainer } from "./StepContainer";
import type { OnboardingFormData } from "@/lib/onboarding";

interface Step3SkillsProps {
  data: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Skills({ data, onUpdate, onNext, onBack }: Step3SkillsProps) {
  const [input, setInput] = useState("");

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
          className="flex-1 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
          placeholder="e.g. React, TypeScript"
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addSkill}
          returnKeyType="done"
        />
        <Pressable
          className="items-center justify-center rounded-xl bg-primary px-5"
          onPress={addSkill}
        >
          <Text className="font-bold text-base text-primary-foreground">+</Text>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {data.skills.map((skill) => (
          <Pressable
            key={skill}
            className="flex-row items-center gap-1.5 rounded-lg bg-surface px-3 py-2"
            onPress={() => removeSkill(skill)}
          >
            <Text className="font-medium text-sm text-foreground">{skill}</Text>
            <Text className="font-sans text-xs text-muted-foreground">✕</Text>
          </Pressable>
        ))}
      </View>

      {data.skills.length === 0 && (
        <Text className="mt-4 text-center font-sans text-sm text-muted-foreground">
          Add at least one skill to continue
        </Text>
      )}
    </StepContainer>
  );
}
