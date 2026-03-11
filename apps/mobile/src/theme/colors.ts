export type ColorScheme = "light" | "dark";

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Borders
  border: string;
  borderLight: string;

  // Primary action
  primary: string;
  primaryText: string;

  // Tags & badges
  tag: string;
  skillTag: string;
  skillTagText: string;

  // Semantic (shared across modes)
  blue: string;
  purple: string;
  amber: string;
  green: string;
  red: string;
  indigo: string;

  // Semantic backgrounds
  blueBg: string;
  purpleBg: string;
  amberBg: string;
  greenBg: string;
  redBg: string;
  indigoBg: string;

  // Misc
  shadow: string;
  inputBackground: string;
  placeholder: string;
}

const shared = {
  blue: "#3b82f6",
  purple: "#8b5cf6",
  amber: "#f59e0b",
  green: "#22c55e",
  red: "#ef4444",
  indigo: "#6366f1",

  blueBg: "#dbeafe",
  purpleBg: "#ede9fe",
  amberBg: "#fef3c7",
  greenBg: "#dcfce7",
  redBg: "#fee2e2",
  indigoBg: "#e0e7ff",
};

export const lightColors: ThemeColors = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  card: "#FFFFFF",

  text: "#141414",
  textSecondary: "#666666",
  textTertiary: "#999999",

  border: "#DDDDDD",
  borderLight: "#EEEEEE",

  primary: "#141414",
  primaryText: "#FFFFFF",

  tag: "#F0F0F0",
  skillTag: "#E0E7FF",
  skillTagText: "#4338CA",

  shadow: "#000000",
  inputBackground: "#F9F9F9",
  placeholder: "#999999",

  ...shared,
};

export const darkColors: ThemeColors = {
  background: "#141414",
  surface: "#1E1E1E",
  card: "#1E1E1E",

  text: "#FAFAFA",
  textSecondary: "#A0A0A0",
  textTertiary: "#707070",

  border: "#333333",
  borderLight: "#2A2A2A",

  primary: "#FAFAFA",
  primaryText: "#141414",

  tag: "#2A2A2A",
  skillTag: "#2D2B5E",
  skillTagText: "#A5B4FC",

  shadow: "#000000",
  inputBackground: "#1E1E1E",
  placeholder: "#707070",

  ...shared,
};
