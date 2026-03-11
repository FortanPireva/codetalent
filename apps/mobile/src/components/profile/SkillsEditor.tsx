import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface SkillsEditorProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export function SkillsEditor({ skills, onSkillsChange }: SkillsEditorProps) {
  const [input, setInput] = useState("");
  const c = useThemeColors();

  function addSkill() {
    const skill = input.trim();
    if (!skill || skills.includes(skill)) {
      setInput("");
      return;
    }
    onSkillsChange([...skills, skill]);
    setInput("");
  }

  function removeSkill(skill: string) {
    onSkillsChange(skills.filter((s) => s !== skill));
  }

  return (
    <View>
      <View className="mb-3 flex-row gap-2">
        <TextInput
          className="flex-1 rounded-xl px-4 py-3 font-sans text-base"
          style={{
            backgroundColor: c.inputBg,
            borderColor: c.border,
            borderWidth: 1,
            color: c.fg,
          }}
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
        {skills.map((skill) => (
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
    </View>
  );
}
