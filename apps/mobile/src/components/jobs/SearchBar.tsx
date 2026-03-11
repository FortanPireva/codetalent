import React from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  hasActiveFilters: boolean;
}

export function SearchBar({ value, onChangeText, onFilterPress, hasActiveFilters }: SearchBarProps) {
  const c = useThemeColors();

  return (
    <View className="flex-row items-center gap-3 px-4 pb-3">
      <View
        className="flex-1 flex-row items-center rounded-xl px-4 py-3"
        style={{ backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.borderLight }}
      >
        <Text className="mr-2 text-base" style={{ color: c.placeholder }}>🔍</Text>
        <TextInput
          className="flex-1 font-sans text-base"
          style={{ color: c.fg }}
          placeholder="Search jobs..."
          placeholderTextColor={c.placeholder}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")} hitSlop={8}>
            <Text className="text-base" style={{ color: c.placeholder }}>✕</Text>
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={onFilterPress}
        className="relative h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.borderLight }}
      >
        <Text className="text-lg">⚙️</Text>
        {hasActiveFilters && (
          <View className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.primary }} />
        )}
      </Pressable>
    </View>
  );
}
