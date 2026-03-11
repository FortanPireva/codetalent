import { View, Image } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

const lightIcon = require("../../assets/icon.png");
const darkIcon = require("../../assets/icon-dark.png");

interface TalentflowLogoProps {
  size?: number;
}

export function TalentflowLogo({ size = 64 }: TalentflowLogoProps) {
  const { isDark } = useTheme();

  return (
    <View className="items-center">
      <Image
        source={isDark ? darkIcon : lightIcon}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}
