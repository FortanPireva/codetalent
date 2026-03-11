import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface ScoreBreakdownProps {
  scores: {
    codeQuality: number | null;
    architecture: number | null;
    typeSafety: number | null;
    errorHandling: number | null;
    testing: number | null;
    gitPractices: number | null;
    documentation: number | null;
    bestPractices: number | null;
  };
}

const CATEGORIES: { key: keyof ScoreBreakdownProps["scores"]; label: string }[] = [
  { key: "codeQuality", label: "Code Quality" },
  { key: "architecture", label: "Architecture" },
  { key: "typeSafety", label: "Type Safety" },
  { key: "errorHandling", label: "Error Handling" },
  { key: "testing", label: "Testing" },
  { key: "gitPractices", label: "Git Practices" },
  { key: "documentation", label: "Documentation" },
  { key: "bestPractices", label: "Best Practices" },
];

function getBarColor(score: number): string {
  if (score >= 4) return "#22c55e";
  if (score >= 3) return "#f59e0b";
  return "#ef4444";
}

export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  const c = useThemeColors();

  return (
    <View className="gap-2.5">
      {CATEGORIES.map(({ key, label }) => {
        const score = scores[key];
        if (score == null) return null;
        const widthPercent = (score / 5) * 100;

        return (
          <View key={key} className="flex-row items-center gap-2">
            <Text className="w-28 font-sans text-xs" style={{ color: c.mutedFg }}>
              {label}
            </Text>
            <View className="h-3 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: c.surface }}>
              <View
                className="h-full rounded-full"
                style={{ width: `${widthPercent}%`, backgroundColor: getBarColor(score) }}
              />
            </View>
            <Text className="w-8 text-right font-medium text-xs" style={{ color: c.fg }}>
              {score.toFixed(1)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
