import { View, Image } from "react-native";

interface TalentflowLogoProps {
  size?: number;
}

export function TalentflowLogo({ size = 64 }: TalentflowLogoProps) {
  return (
    <View className="items-center">
      <Image
        source={require("../../assets/icon.png")}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}
