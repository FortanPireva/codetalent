import { View, Pressable, Text, StyleSheet } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";

const SPRING_CONFIG = { damping: 15, stiffness: 200 };

function TabBarButton({
  label,
  icon,
  isFocused,
  onPress,
  onLongPress,
  badge,
}: {
  label: string;
  icon: React.ReactNode;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  badge?: number;
}) {
  const c = useThemeColors();
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
  }, [isFocused]);

  const animatedIcon = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.15]) }],
  }));

  const animatedDot = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      style={styles.tabButton}
    >
      <Animated.View style={animatedIcon}>
        <View>
          {icon}
          {(badge ?? 0) > 0 && (
            <View
              style={[
                styles.badge,
                { borderColor: c.card },
              ]}
            />
          )}
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: c.primary },
          animatedDot,
        ]}
      />
    </Pressable>
  );
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const c = useThemeColors();

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: c.card,
            borderColor: c.border,
            shadowColor: c.fg,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = (options.tabBarLabel ?? options.title ?? route.name) as string;
          const isFocused = state.index === index;

          const color = isFocused ? c.activeTab : c.inactiveTab;
          const icon = options.tabBarIcon?.({
            focused: isFocused,
            color,
            size: 22,
          });
          const badge = options.tabBarBadge as number | undefined;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TabBarButton
              key={route.key}
              label={label}
              icon={icon}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              badge={badge}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  container: {
    flexDirection: "row",
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 6,
    width: 12,
    height: 12,
    borderWidth: 2,
  },
});
