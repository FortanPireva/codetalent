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
        <Text className="mb-1 font-bold text-2xl text-foreground">{title}</Text>
        <Text className="mb-6 font-sans text-base text-muted-foreground">
          {description}
        </Text>
        {children}
      </ScrollView>

      <View className="flex-row gap-3 border-t border-border-light px-6 pb-8 pt-4">
        {!isFirst && onBack && (
          <Pressable
            className="flex-1 items-center rounded-xl border border-border py-4"
            onPress={onBack}
          >
            <Text className="font-medium text-base text-foreground">Back</Text>
          </Pressable>
        )}
        <Pressable
          className={`flex-1 items-center rounded-xl bg-primary py-4 ${loading ? "opacity-60" : ""}`}
          onPress={onNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="font-medium text-base text-primary-foreground">
              {nextLabel ?? (isLast ? "Submit" : "Continue")}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
