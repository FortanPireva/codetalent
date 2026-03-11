import { View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const c = useThemeColors();

  return (
    <View className="flex-row items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View key={i} className="flex-row items-center">
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={
              i < currentStep
                ? { backgroundColor: c.primary }
                : i === currentStep
                  ? { borderWidth: 2, borderColor: c.primary, backgroundColor: "transparent" }
                  : { backgroundColor: c.border }
            }
          />
          {i < totalSteps - 1 && (
            <View
              className="h-0.5 w-6"
              style={{ backgroundColor: i < currentStep ? c.primary : c.border }}
            />
          )}
        </View>
      ))}
    </View>
  );
}
