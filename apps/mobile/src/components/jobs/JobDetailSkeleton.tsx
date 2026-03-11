import React from "react";
import { View } from "react-native";
import { SkeletonBox, SkeletonText } from "../Skeleton";

export function JobDetailSkeleton() {
  return (
    <View className="p-4">
      {/* Company avatar + title */}
      <View className="mb-4 items-center">
        <SkeletonBox width={56} height={56} borderRadius={14} />
        <SkeletonText width="60%" height={22} style={{ marginTop: 12 }} />
        <SkeletonText width="35%" height={14} style={{ marginTop: 8 }} />
        <SkeletonText width="40%" height={12} style={{ marginTop: 6 }} />
      </View>

      {/* Quick info pills */}
      <View className="mb-6 flex-row justify-center gap-2">
        <SkeletonBox width={90} height={28} borderRadius={8} />
        <SkeletonBox width={80} height={28} borderRadius={8} />
        <SkeletonBox width={100} height={28} borderRadius={8} />
      </View>

      {/* Section 1 */}
      <SkeletonText width="30%" height={18} style={{ marginBottom: 10 }} />
      <SkeletonText width="100%" style={{ marginBottom: 4 }} />
      <SkeletonText width="100%" style={{ marginBottom: 4 }} />
      <SkeletonText width="75%" style={{ marginBottom: 20 }} />

      {/* Section 2 */}
      <SkeletonText width="35%" height={18} style={{ marginBottom: 10 }} />
      <SkeletonText width="90%" style={{ marginBottom: 4 }} />
      <SkeletonText width="85%" style={{ marginBottom: 4 }} />
      <SkeletonText width="70%" style={{ marginBottom: 20 }} />

      {/* Section 3 */}
      <SkeletonText width="25%" height={18} style={{ marginBottom: 10 }} />
      <View className="flex-row flex-wrap gap-2">
        <SkeletonBox width={64} height={24} borderRadius={6} />
        <SkeletonBox width={72} height={24} borderRadius={6} />
        <SkeletonBox width={56} height={24} borderRadius={6} />
        <SkeletonBox width={80} height={24} borderRadius={6} />
        <SkeletonBox width={60} height={24} borderRadius={6} />
      </View>
    </View>
  );
}
