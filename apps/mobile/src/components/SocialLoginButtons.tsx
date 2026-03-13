import { View, Text, Pressable, Platform, ActivityIndicator } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSocialAuth } from "@/hooks/useSocialAuth";

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 48 48" width={size} height={size}>
      <Path
        fill="#FBBC05"
        d="M9.827 24c0-1.524.254-2.986.705-4.356L2.623 13.604A23.71 23.71 0 0 0 .214 24c0 3.737.867 7.261 2.406 10.388l7.905-6.051A13.89 13.89 0 0 1 9.827 24"
      />
      <Path
        fill="#EB4335"
        d="M23.714 10.133c3.311 0 6.302 1.174 8.652 3.094l6.836-6.827C35.036 2.773 29.695.533 23.714.533 14.427.533 6.445 5.844 2.623 13.604l7.91 6.04c1.822-5.532 7.016-9.51 13.18-9.51"
      />
      <Path
        fill="#34A853"
        d="M23.714 37.867c-6.165 0-11.36-3.979-13.182-9.51l-7.909 6.038C6.445 42.156 14.427 47.467 23.714 47.467c5.732 0 11.204-2.036 15.311-5.849l-7.507-5.804c-2.118 1.335-4.786 2.053-7.804 2.053"
      />
      <Path
        fill="#4285F4"
        d="M46.145 24c0-1.387-.213-2.88-.534-4.267H23.714V28.8h12.604c-.63 3.091-2.346 5.468-4.8 7.014l7.507 5.804c4.314-3.998 7.12-9.969 7.12-17.618"
      />
    </Svg>
  );
}

function AppleLogo({ size = 20, color }: { size?: number; color: string }) {
  return (
    <Svg viewBox="0 0 14 18" width={size} height={size}>
      <Path
        fill={color}
        d="M10.05 1.295c.494-.574.836-1.37.728-2.17-.704.028-1.56.47-2.065 1.043-.455.508-.853 1.32-.733 2.1.796.06 1.608-.398 2.07-.973ZM12.7 9.43c.02 2.054 1.8 2.738 1.821 2.747-.015.048-.284.974-.938 1.93-.575.826-1.171 1.65-2.11 1.667-.923.017-1.22-.548-2.275-.548s-1.393.531-2.268.565c-.906.033-1.597-.893-2.177-1.716-1.185-1.685-2.09-4.762-1.134-6.683.616-1.03 1.553-1.572 2.357-1.588.892-.016 1.734.6 2.28.6.546 0 1.567-.742 2.64-.633.463.018 1.764.187 2.6 1.408-.063.04-1.552.906-1.536 2.703"
      />
    </Svg>
  );
}

interface SocialLoginButtonsProps {
  loading?: boolean;
}

export function SocialLoginButtons({ loading: externalLoading }: SocialLoginButtonsProps) {
  const c = useThemeColors();
  const { signInWithGoogle, signInWithApple, loading: socialLoading } = useSocialAuth();
  const loading = externalLoading || socialLoading;

  return (
    <View>
      <Pressable
        className={`mb-3 flex-row items-center justify-center rounded-xl py-4 ${loading ? "opacity-60" : ""}`}
        style={{
          backgroundColor: c.inputBg,
          borderColor: c.border,
          borderWidth: 1,
          gap: 12,
        }}
        onPress={signInWithGoogle}
        disabled={loading}
      >
        {socialLoading ? (
          <ActivityIndicator size="small" color={c.fg} />
        ) : (
          <>
            <GoogleLogo />
            <Text className="font-medium text-base" style={{ color: c.fg }}>
              Continue with Google
            </Text>
          </>
        )}
      </Pressable>

      {Platform.OS === "ios" && (
        <Pressable
          className={`flex-row items-center justify-center rounded-xl py-4 ${loading ? "opacity-60" : ""}`}
          style={{
            backgroundColor: c.fg,
            gap: 12,
          }}
          onPress={signInWithApple}
          disabled={loading}
        >
          {socialLoading ? (
            <ActivityIndicator size="small" color={c.bg} />
          ) : (
            <>
              <AppleLogo color={c.bg} />
              <Text className="font-medium text-base" style={{ color: c.bg }}>
                Sign in with Apple
              </Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}
