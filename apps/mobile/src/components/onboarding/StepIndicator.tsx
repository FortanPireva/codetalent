import { View } from "react-native";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View key={i} className="flex-row items-center">
          <View
            className={`h-2.5 w-2.5 rounded-full ${
              i < currentStep
                ? "bg-primary"
                : i === currentStep
                  ? "border-2 border-primary bg-transparent"
                  : "bg-border"
            }`}
          />
          {i < totalSteps - 1 && (
            <View
              className={`h-0.5 w-6 ${
                i < currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );
}
