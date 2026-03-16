import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
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
import { Bookmark, MapPin } from "lucide-react-native";

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

function CompanyAvatar({ name, logo, size = 44, colors }: { name: string; logo?: string | null; size?: number; colors: ReturnType<typeof useThemeColors> }) {
  const [imgError, setImgError] = useState(false);
  const initial = name.charAt(0).toUpperCase();
  const borderRadius = size > 40 ? 16 : 12;

  if (logo && !imgError) {
    return (
      <Image
        source={{ uri: logo }}
        style={{ width: size, height: size, borderRadius }}
        onError={() => setImgError(true)}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: colors.tag,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text className="font-bold" style={{ color: colors.mutedFg, fontSize: size * 0.4 }}>{initial}</Text>
    </View>
  );
}

export { CompanyAvatar };

export function JobCard({ job, index, isBookmarked, onToggleBookmark, onPress }: JobCardProps) {
  const c = useThemeColors();
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

  const salary =
    job.showSalary !== false
      ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)
      : "";

  const MAX_SKILLS = 4;
  const visibleSkills = job.requiredSkills.slice(0, MAX_SKILLS);
  const overflowCount = job.requiredSkills.length - MAX_SKILLS;

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        pressStyle,
        {
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.borderLight,
        },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      className="mb-3 rounded-2xl p-4"
    >
      {/* Header: avatar + title + bookmark */}
      <View className="mb-3 flex-row items-center">
        <View className="mr-3">
          <CompanyAvatar name={job.client.name} logo={job.client.logo} size={44} colors={c} />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-base leading-5" style={{ color: c.fg }} numberOfLines={1}>
            {job.title}
          </Text>
          <Text className="mt-0.5 font-sans text-sm" style={{ color: c.mutedFg }}>{job.client.name}</Text>
        </View>
        <Pressable onPress={handleBookmark} hitSlop={12} className="ml-2">
          <Animated.View style={bookmarkAnimStyle}>
            <Bookmark
              size={20}
              strokeWidth={1.5}
              color={isBookmarked ? c.highlight : c.mutedFg}
              fill={isBookmarked ? c.highlight : "none"}
            />
          </Animated.View>
        </Pressable>
      </View>

      {/* Summary */}
      {job.summary && (
        <Text className="mb-3 font-sans text-sm leading-5" style={{ color: c.mutedFg }} numberOfLines={2}>
          {job.summary}
        </Text>
      )}

      {/* Salary + location row */}
      {(salary || job.location) && (
        <View className="mb-3 flex-row items-center">
          {salary ? (
            <View className="mr-2 flex-row items-center rounded-lg px-2.5 py-1" style={{ backgroundColor: c.highlightBg }}>
              <Text className="font-semibold text-xs" style={{ color: c.highlight }}>{salary}</Text>
            </View>
          ) : null}
          {job.location && (
            <View className="flex-row items-center">
              <View className="mr-1">
                <MapPin size={12} strokeWidth={1.5} color={c.placeholder} />
              </View>
              <Text className="font-sans text-xs" style={{ color: c.placeholder }}>{job.location}</Text>
            </View>
          )}
        </View>
      )}

      {/* Tags — all monochrome */}
      <View className="mb-3 flex-row flex-wrap gap-1.5">
        {job.experienceLevel && (
          <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: c.tag }}>
            <Text className="font-medium text-xs" style={{ color: c.tagText }}>
              {experienceLevelLabels[job.experienceLevel] ?? job.experienceLevel}
            </Text>
          </View>
        )}
        {job.workArrangement && (
          <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: c.tag }}>
            <Text className="font-medium text-xs" style={{ color: c.tagText }}>
              {workArrangementLabels[job.workArrangement] ?? job.workArrangement}
            </Text>
          </View>
        )}
        {job.employmentType && (
          <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: c.tag }}>
            <Text className="font-medium text-xs" style={{ color: c.tagText }}>
              {employmentTypeLabels[job.employmentType] ?? job.employmentType}
            </Text>
          </View>
        )}
      </View>

      {/* Skills — monochrome */}
      {visibleSkills.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5">
          {visibleSkills.map((skill) => (
            <View key={skill} className="rounded-lg px-2.5 py-1" style={{ backgroundColor: c.tag }}>
              <Text className="font-medium text-xs" style={{ color: c.tagText }}>{skill}</Text>
            </View>
          ))}
          {overflowCount > 0 && (
            <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: c.tag }}>
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
