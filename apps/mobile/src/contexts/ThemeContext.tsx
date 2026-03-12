import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Appearance, AppState } from "react-native";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemePreference = "light" | "dark" | "system";
type ResolvedScheme = "light" | "dark";

interface ThemeContextType {
  theme: ThemePreference;
  colorScheme: ResolvedScheme;
  isDark: boolean;
  setTheme: (theme: ThemePreference) => void;
}

const THEME_KEY = "theme_preference";

function resolveScheme(pref: ThemePreference): ResolvedScheme {
  if (pref === "system") {
    return Appearance.getColorScheme() ?? "light";
  }
  return pref;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  colorScheme: "light",
  isDark: false,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ResolvedScheme>(resolveScheme("system"));
  const { setColorScheme } = useColorScheme();

  // Load stored preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
        const scheme = resolveScheme(stored);
        setResolved(scheme);
        setColorScheme(scheme);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for OS theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;

    const syncSystem = () => {
      const scheme = Appearance.getColorScheme() ?? "light";
      setResolved(scheme);
      setColorScheme(scheme);
    };

    // Listen for OS appearance changes
    const appearanceListener = Appearance.addChangeListener(() => syncSystem());

    // Also re-check when app returns to foreground (more reliable)
    const appStateListener = AppState.addEventListener("change", (state) => {
      if (state === "active") syncSystem();
    });

    return () => {
      appearanceListener.remove();
      appStateListener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
    const scheme = resolveScheme(newTheme);
    setResolved(scheme);
    setColorScheme(scheme);
    AsyncStorage.setItem(THEME_KEY, newTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme: resolved,
        isDark: resolved === "dark",
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
