import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

type Variant = "blue" | "purple" | "amber" | "green" | "default";

const lightVariants: Record<Variant, { bg: string; text: string }> = {
  blue: { bg: "#DBEAFE", text: "#1D4ED8" },
  purple: { bg: "#EDE9FE", text: "#7C3AED" },
  amber: { bg: "#FEF3C7", text: "#B45309" },
  green: { bg: "#D1FAE5", text: "#047857" },
  default: { bg: "", text: "" },
};

const darkVariants: Record<Variant, { bg: string; text: string }> = {
  blue: { bg: "#1E3A5F", text: "#60A5FA" },
  purple: { bg: "#2E1065", text: "#A78BFA" },
  amber: { bg: "#451A03", text: "#FBBF24" },
  green: { bg: "#052E16", text: "#34D399" },
  default: { bg: "", text: "" },
};

interface InfoPillProps {
  icon?: string;
  label: string;
  variant?: Variant;
}

export function InfoPill({ icon, label, variant = "default" }: InfoPillProps) {
  const c = useThemeColors();
  const isDefault = variant === "default";
  const v = c.bg === "#141414" ? darkVariants[variant] : lightVariants[variant];

  return (
    <View
      className="flex-row items-center rounded-lg px-3 py-1.5"
      style={{ backgroundColor: isDefault ? c.tag : v.bg }}
    >
      {icon && <Text className="mr-1 text-sm">{icon}</Text>}
      <Text className="font-medium text-xs" style={{ color: isDefault ? c.mutedFg : v.text }}>
        {label}
      </Text>
    </View>
  );
}
