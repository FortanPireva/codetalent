import { ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface StepContainerProps {
  title: string;
  description: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  isFirst?: boolean;
  isLast?: boolean;
  loading?: boolean;
}

export function StepContainer({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel,
  isFirst,
  isLast,
  loading,
}: StepContainerProps) {
  const c = useThemeColors();

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-1 font-bold text-2xl" style={{ color: c.fg }}>{title}</Text>
        <Text className="mb-6 font-sans text-base" style={{ color: c.mutedFg }}>
          {description}
        </Text>
        {children}
      </ScrollView>

      <View
        className="flex-row gap-3 px-6 pb-8 pt-4"
        style={{ borderTopWidth: 1, borderTopColor: c.borderLight }}
      >
        {!isFirst && onBack && (
          <Pressable
            className="flex-1 items-center rounded-xl py-4"
            style={{ borderWidth: 1, borderColor: c.border }}
            onPress={onBack}
          >
            <Text className="font-medium text-base" style={{ color: c.fg }}>Back</Text>
          </Pressable>
        )}
        <Pressable
          className={`flex-1 items-center rounded-xl py-4 ${loading ? "opacity-60" : ""}`}
          style={{ backgroundColor: c.primary }}
          onPress={onNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={c.primaryFg} size="small" />
          ) : (
            <Text className="font-medium text-base" style={{ color: c.primaryFg }}>
              {nextLabel ?? (isLast ? "Submit" : "Continue")}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
