import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  experienceLevelLabels,
  employmentTypeLabels,
  workArrangementLabels,
  formatSalary,
} from "@/lib/constants";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    summary?: string | null;
    experienceLevel?: string | null;
    employmentType?: string | null;
    workArrangement?: string | null;
    location?: string | null;
    showSalary?: boolean;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string;
    salaryPeriod?: string;
    requiredSkills: string[];
    client: { name: string; logo?: string | null };
  };
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Tag color variants
const tagVariants = {
  purple: {
    light: { bg: "#EDE9FE", text: "#7C3AED" },
    dark: { bg: "#2E1065", text: "#A78BFA" },
  },
  blue: {
    light: { bg: "#DBEAFE", text: "#1D4ED8" },
    dark: { bg: "#1E3A5F", text: "#60A5FA" },
  },
  amber: {
    light: { bg: "#FEF3C7", text: "#B45309" },
    dark: { bg: "#451A03", text: "#FBBF24" },
  },
};

export function JobCard({ job, index, isBookmarked, onToggleBookmark, onPress }: JobCardProps) {
  const c = useThemeColors();
  const isDark = c.bg === "#141414";
  const scale = useSharedValue(1);
  const bookmarkScale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bookmarkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleBookmark = () => {
    bookmarkScale.value = withSpring(1.3, { damping: 8, stiffness: 400 }, () => {
      bookmarkScale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    onToggleBookmark();
  };

  const initial = job.client.name.charAt(0).toUpperCase();
  const salary =
    job.showSalary !== false
      ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)
      : "";

  const MAX_SKILLS = 4;
  const visibleSkills = job.requiredSkills.slice(0, MAX_SKILLS);
  const overflowCount = job.requiredSkills.length - MAX_SKILLS;

  const getTagColors = (variant: keyof typeof tagVariants) =>
    isDark ? tagVariants[variant].dark : tagVariants[variant].light;

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 50).springify()}
      style={[pressStyle, { backgroundColor: c.card }]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      className="mb-3 rounded-xl p-4 shadow-sm"
    >
      {/* Header: avatar + title + bookmark */}
      <View className="mb-2 flex-row items-start">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: c.tag }}>
          <Text className="font-bold text-base" style={{ color: c.mutedFg }}>{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-bold text-base" style={{ color: c.fg }} numberOfLines={1}>
            {job.title}
          </Text>
          <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>{job.client.name}</Text>
        </View>
        <Pressable onPress={handleBookmark} hitSlop={12}>
          <Animated.Text style={bookmarkAnimStyle} className="text-xl">
            {isBookmarked ? "🔖" : "🏷️"}
          </Animated.Text>
        </Pressable>
      </View>

      {/* Summary */}
      {job.summary && (
        <Text className="mb-2 font-sans text-sm leading-5" style={{ color: c.mutedFg }} numberOfLines={2}>
          {job.summary}
        </Text>
      )}

      {/* Tags */}
      <View className="mb-2 flex-row flex-wrap gap-1.5">
        {job.experienceLevel && (
          <View className="rounded-md px-2 py-1" style={{ backgroundColor: getTagColors("purple").bg }}>
            <Text className="font-medium text-xs" style={{ color: getTagColors("purple").text }}>
              {experienceLevelLabels[job.experienceLevel] ?? job.experienceLevel}
            </Text>
          </View>
        )}
        {job.workArrangement && (
          <View className="rounded-md px-2 py-1" style={{ backgroundColor: getTagColors("blue").bg }}>
            <Text className="font-medium text-xs" style={{ color: getTagColors("blue").text }}>
              {workArrangementLabels[job.workArrangement] ?? job.workArrangement}
            </Text>
          </View>
        )}
        {job.employmentType && (
          <View className="rounded-md px-2 py-1" style={{ backgroundColor: getTagColors("amber").bg }}>
            <Text className="font-medium text-xs" style={{ color: getTagColors("amber").text }}>
              {employmentTypeLabels[job.employmentType] ?? job.employmentType}
            </Text>
          </View>
        )}
      </View>

      {/* Salary + location */}
      {(salary || job.location) && (
        <View className="mb-2 flex-row items-center">
          {salary ? (
            <Text className="font-bold text-sm" style={{ color: "#22c55e" }}>{salary}</Text>
          ) : null}
          {salary && job.location && (
            <Text className="mx-1.5 text-xs" style={{ color: c.placeholder }}>•</Text>
          )}
          {job.location && (
            <Text className="font-sans text-xs" style={{ color: c.placeholder }}>{job.location}</Text>
          )}
        </View>
      )}

      {/* Skills */}
      {visibleSkills.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5">
          {visibleSkills.map((skill) => (
            <View key={skill} className="rounded-md px-2 py-1" style={{ backgroundColor: c.skillTag }}>
              <Text className="font-medium text-xs" style={{ color: c.skillTagText }}>{skill}</Text>
            </View>
          ))}
          {overflowCount > 0 && (
            <View className="rounded-md px-2 py-1" style={{ backgroundColor: c.tag }}>
              <Text className="font-medium text-xs" style={{ color: c.mutedFg }}>
                +{overflowCount}
              </Text>
            </View>
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}
