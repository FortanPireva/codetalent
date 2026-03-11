import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface InterviewTimelineProps {
  stages: string[];
}

export function InterviewTimeline({ stages }: InterviewTimelineProps) {
  const c = useThemeColors();

  if (stages.length === 0) return null;

  return (
    <View className="ml-1">
      {stages.map((stage, i) => (
        <View key={stage} className="flex-row">
          {/* Left column: circle + line */}
          <View className="mr-3 items-center" style={{ width: 28 }}>
            <View
              className="h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: c.primary }}
            >
              <Text className="font-bold text-xs" style={{ color: c.primaryFg }}>
                {i + 1}
              </Text>
            </View>
            {i < stages.length - 1 && (
              <View className="w-0.5 flex-1" style={{ minHeight: 20, backgroundColor: c.borderLight }} />
            )}
          </View>
          {/* Right column: stage name */}
          <View className="flex-1 pb-4 pt-1">
            <Text className="font-medium text-sm" style={{ color: c.fg }}>{stage}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
