import React, { useEffect } from "react";
import { type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useThemeColors } from "@/hooks/useThemeColors";

function useSkeletonOpacity() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

interface SkeletonBoxProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width, height, borderRadius = 8, style }: SkeletonBoxProps) {
  const animStyle = useSkeletonOpacity();
  const c = useThemeColors();

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: c.bg === "#141414" ? "#2A2A2A" : "#E5E5E5",
        },
        animStyle,
        style,
      ]}
    />
  );
}

interface SkeletonTextProps {
  width: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
}

export function SkeletonText({ width, height = 14, style }: SkeletonTextProps) {
  return <SkeletonBox width={width} height={height} borderRadius={4} style={style} />;
}
