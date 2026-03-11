import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemePreference = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemePreference;
  colorScheme: "light" | "dark";
  isDark: boolean;
  setTheme: (theme: ThemePreference) => void;
}

const THEME_KEY = "theme_preference";

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  colorScheme: "light",
  isDark: false,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const { colorScheme, setColorScheme } = useColorScheme();

  // Load stored preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
        setColorScheme(stored === "system" ? "system" : stored);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync NativeWind whenever theme preference changes
  useEffect(() => {
    setColorScheme(theme === "system" ? "system" : theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
    setColorScheme(newTheme === "system" ? "system" : newTheme);
    AsyncStorage.setItem(THEME_KEY, newTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use NativeWind's resolved colorScheme as source of truth
  const resolved = colorScheme ?? "light";

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
