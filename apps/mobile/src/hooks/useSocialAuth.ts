import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import {
  useIdTokenAuthRequest,
  discovery,
} from "expo-auth-session/providers/google";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import { api } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

WebBrowser.maybeCompleteAuthSession();

export function useSocialAuth() {
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();
  const socialLoginMutation = api.auth.socialLogin.useMutation();

  const [request, response, promptAsync] = useIdTokenAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  const handleSocialLogin = useCallback(
    async (provider: "google" | "apple", idToken: string, name?: string) => {
      setLoading(true);
      try {
        const result = await socialLoginMutation.mutateAsync({
          provider,
          idToken,
          name,
        });
        await loginWithToken(result.token, result.user);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Social login failed";
        Alert.alert("Login Failed", message);
      } finally {
        setLoading(false);
      }
    },
    [socialLoginMutation, loginWithToken]
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await promptAsync();
      if (result.type === "success") {
        const idToken = result.params.id_token;
        if (idToken) {
          await handleSocialLogin("google", idToken);
        }
      }
    } catch {
      Alert.alert("Error", "Google sign-in was cancelled or failed");
    }
  }, [promptAsync, handleSocialLogin]);

  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== "ios") return;

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert("Error", "Apple sign-in failed: no identity token");
        return;
      }

      const name = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName]
          .filter(Boolean)
          .join(" ") || undefined
        : undefined;

      await handleSocialLogin("apple", credential.identityToken, name);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Error", "Apple sign-in failed");
      }
    }
  }, [handleSocialLogin]);

  return {
    signInWithGoogle,
    signInWithApple,
    loading,
  };
}
