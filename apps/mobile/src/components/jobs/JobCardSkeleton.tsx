import React from "react";
import { View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { SkeletonBox, SkeletonText } from "../Skeleton";

export function JobCardSkeleton() {
  const c = useThemeColors();

  return (
    <View className="mb-3 rounded-xl p-4" style={{ backgroundColor: c.card }}>
      {/* Header row: avatar + title/company */}
      <View className="mb-3 flex-row">
        <SkeletonBox width={40} height={40} borderRadius={10} />
        <View className="ml-3 flex-1">
          <SkeletonText width="70%" height={16} />
          <SkeletonText width="40%" height={13} style={{ marginTop: 6 }} />
        </View>
      </View>
      {/* Summary */}
      <SkeletonText width="100%" style={{ marginBottom: 4 }} />
      <SkeletonText width="80%" style={{ marginBottom: 12 }} />
      {/* Tags */}
      <View className="flex-row gap-2">
        <SkeletonBox width={72} height={24} borderRadius={6} />
        <SkeletonBox width={64} height={24} borderRadius={6} />
        <SkeletonBox width={80} height={24} borderRadius={6} />
      </View>
      {/* Salary + skills */}
      <SkeletonText width="45%" height={14} style={{ marginTop: 12 }} />
      <View className="mt-2 flex-row gap-1.5">
        <SkeletonBox width={56} height={22} borderRadius={6} />
        <SkeletonBox width={48} height={22} borderRadius={6} />
        <SkeletonBox width={64} height={22} borderRadius={6} />
      </View>
    </View>
  );
}
