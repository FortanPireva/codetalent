import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { LucideIcon } from "lucide-react-native";

interface InfoPillProps {
  icon?: LucideIcon;
  label: string;
  accent?: boolean;
}

export function InfoPill({ icon: Icon, label, accent = false }: InfoPillProps) {
  const c = useThemeColors();

  const bgColor = accent ? c.highlightBg : c.tag;
  const textColor = accent ? c.highlightText : c.tagText;

  return (
    <View
      className="flex-row items-center rounded-lg px-3 py-1.5"
      style={{ backgroundColor: bgColor }}
    >
      {Icon && (
        <View className="mr-1.5">
          <Icon size={14} strokeWidth={1.5} color={textColor} />
        </View>
      )}
      <Text className="font-medium text-xs" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}
