import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface VerifiedBadgeProps {
  passedAssessmentCount: number;
  hasSubmissionsUnderReview: boolean;
}

export function VerifiedBadge({
  passedAssessmentCount,
  hasSubmissionsUnderReview,
}: VerifiedBadgeProps) {
  const c = useThemeColors();
  const isDark = c.bg === "#141414";

  if (passedAssessmentCount >= 1) {
    return (
      <View
        className="flex-row items-center gap-1.5 rounded-full px-3 py-1"
        style={{ backgroundColor: isDark ? "#052E16" : "#DCFCE7" }}
      >
        <Text className="text-sm">✓</Text>
        <Text className="font-medium text-xs" style={{ color: isDark ? "#4ADE80" : "#15803D" }}>
          Verified
        </Text>
      </View>
    );
  }

  if (hasSubmissionsUnderReview) {
    return (
      <View
        className="flex-row items-center gap-1.5 rounded-full px-3 py-1"
        style={{ backgroundColor: isDark ? "#451A03" : "#FEF3C7" }}
      >
        <Text className="text-sm">⏳</Text>
        <Text className="font-medium text-xs" style={{ color: isDark ? "#FBBF24" : "#B45309" }}>
          Pending
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-row items-center gap-1.5 rounded-full px-3 py-1"
      style={{ backgroundColor: isDark ? "#1F2937" : "#F3F4F6" }}
    >
      <Text className="font-medium text-xs" style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>
        Not Verified
      </Text>
    </View>
  );
}
