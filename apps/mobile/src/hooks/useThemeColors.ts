import { useTheme } from "@/contexts/ThemeContext";

const palette = {
  light: {
    bg: "#FFFFFF",
    fg: "#141414",
    surface: "#F5F5F5",
    card: "#FFFFFF",
    cardFg: "#141414",
    mutedFg: "#666666",
    inputBg: "#F9F9F9",
    border: "#DDDDDD",
    borderLight: "#EEEEEE",
    primary: "#141414",
    primaryFg: "#FFFFFF",
    secondary: "#F5F5F5",
    secondaryFg: "#141414",
    placeholder: "#999999",
    destructive: "#ef4444",
    destructiveFg: "#FFFFFF",
    tag: "#F0F0F0",
    skillTag: "#E0E7FF",
    skillTagText: "#4338CA",
    accent: "#F5F5F5",
    accentFg: "#141414",
    ring: "#141414",
    toggleOff: "#D1D5DB",
  },
  dark: {
    bg: "#141414",
    fg: "#FAFAFA",
    surface: "#1E1E1E",
    card: "#1E1E1E",
    cardFg: "#FAFAFA",
    mutedFg: "#A0A0A0",
    inputBg: "#1E1E1E",
    border: "#333333",
    borderLight: "#2A2A2A",
    primary: "#FAFAFA",
    primaryFg: "#141414",
    secondary: "#1E1E1E",
    secondaryFg: "#FAFAFA",
    placeholder: "#707070",
    destructive: "#ef4444",
    destructiveFg: "#FFFFFF",
    tag: "#2A2A2A",
    skillTag: "#2D2B5E",
    skillTagText: "#A5B4FC",
    accent: "#1E1E1E",
    accentFg: "#FAFAFA",
    ring: "#FAFAFA",
    toggleOff: "#4B5563",
  },
} as const;

export type ThemeColors = (typeof palette)["light"];

export function useThemeColors() {
  const { isDark } = useTheme();
  return isDark ? palette.dark : palette.light;
}
