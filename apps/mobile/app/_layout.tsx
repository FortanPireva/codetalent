import "../global.css";

import { useState, useEffect, useCallback } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { api, createMobileTRPCClient } from "@/lib/trpc";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";

const lightIcon = require("../assets/icon.png");
const darkIcon = require("../assets/icon-dark.png");

SplashScreen.preventAutoHideAsync();

const MIN_SPLASH_MS = 1400;

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => createMobileTRPCClient());

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <RootLayoutInner />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </api.Provider>
  );
}

function RootLayoutInner() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { colorScheme, isDark } = useTheme();
  const bgColor = isDark ? "#141414" : "#FFFFFF";
  const fgColor = isDark ? "#FAFAFA" : "#141414";
  const mutedColor = isDark ? "#A0A0A0" : "#666666";

  useNotifications(isAuthenticated);

  const [fontsLoaded] = useFonts({
    "Satoshi-Regular": require("../assets/fonts/Satoshi-Regular.ttf"),
    "Satoshi-Medium": require("../assets/fonts/Satoshi-Medium.ttf"),
    "Satoshi-Bold": require("../assets/fonts/Satoshi-Bold.ttf"),
  });

  const resourcesReady = fontsLoaded && !authLoading;

  // Track when resources became ready so we can enforce a min display time
  const [readyAt, setReadyAt] = useState<number | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  // Animation values
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const splashOpacity = useSharedValue(1);

  // Hide native splash and start enter animation once resources load
  useEffect(() => {
    if (resourcesReady && readyAt === null) {
      setReadyAt(Date.now());
      SplashScreen.hideAsync();

      // Entrance animations
      logoOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
      logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) });
      textOpacity.value = withDelay(250, withTiming(1, { duration: 450 }));
      subtitleOpacity.value = withDelay(450, withTiming(1, { duration: 400 }));
    }
  }, [resourcesReady]);

  // After min display time, play exit animation
  useEffect(() => {
    if (readyAt === null) return;

    const elapsed = Date.now() - readyAt;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

    const timeout = setTimeout(() => {
      splashOpacity.value = withTiming(0, { duration: 350, easing: Easing.in(Easing.quad) }, () => {
        runOnJS(setShowSplash)(false);
      });
    }, remaining);

    return () => clearTimeout(timeout);
  }, [readyAt]);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: interpolate(textOpacity.value, [0, 1], [10, 0]) }],
  }));

  const subtitleAnimStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const splashContainerStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  // Show nothing until resources are ready (native splash covers this)
  if (!resourcesReady) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bgColor } }} />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {showSplash && (
        <Animated.View
          style={[styles.splashContainer, { backgroundColor: bgColor }, splashContainerStyle]}
          pointerEvents="none"
        >
          <View style={styles.splashContent}>
            <Animated.View style={logoAnimStyle}>
              <Image
                source={isDark ? darkIcon : lightIcon}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            <Animated.Text
              style={[styles.title, { color: fgColor, fontFamily: "Satoshi-Bold" }, textAnimStyle]}
            >
              Talentflow
            </Animated.Text>

            <Animated.Text
              style={[styles.subtitle, { color: mutedColor, fontFamily: "Satoshi-Regular" }, subtitleAnimStyle]}
            >
              Where code speaks louder than resumes
            </Animated.Text>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  splashContent: {
    alignItems: "center",
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
  },
});
