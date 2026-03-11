import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import {
  type ColorScheme,
  type ThemeColors,
  lightColors,
  darkColors,
} from "@/theme/colors";

interface ThemeContextValue {
  colors: ThemeColors;
  colorScheme: ColorScheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  colorScheme: "light",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const colorScheme: ColorScheme = systemScheme === "dark" ? "dark" : "light";
  const colors = colorScheme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
