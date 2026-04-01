import { useState, useCallback, useEffect } from "react";
import { Platform, Alert } from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { api } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

export function useSocialAuth() {
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();
  const socialLoginMutation = api.auth.socialLogin.useMutation();

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const handleSocialLogin = useCallback(
    async (provider: "google" | "apple", idToken: string, name?: string) => {
      setLoading(true);
      try {
        const result = await socialLoginMutation.mutateAsync({
          provider,
          idToken,
          name,
        });

        if (result.user.role === "CLIENT" || result.user.role === "ADMIN") {
          Alert.alert(
            "Access Restricted",
            "This app is for developers only. Please use the web platform.",
          );
          return;
        }

        await loginWithToken(result.token, result.user);
      } catch (err: unknown) {
        console.error("Social login error:", err);
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
    // Separate Google auth dialog errors from login errors
    let idToken: string | undefined;
    try {
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices();
      }
      const response = await GoogleSignin.signIn();

      if (response.type === "success" && response.data.idToken) {
        idToken = response.data.idToken;
      }
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const code = (err as { code?: string })?.code;
      if (
        code !== statusCodes.SIGN_IN_CANCELLED &&
        code !== statusCodes.IN_PROGRESS
      ) {
        const message = err instanceof Error ? err.message : "Google sign-in failed";
        Alert.alert("Error", message);
      }
      return;
    }

    // handleSocialLogin has its own error handling — don't wrap it
    if (idToken) {
      await handleSocialLogin("google", idToken);
    }
  }, [handleSocialLogin]);

  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== "ios") return;

    // Separate Apple auth dialog errors from login errors
    let credential: AppleAuthentication.AppleAuthenticationCredential;
    try {
      credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });
    } catch {
      // Any Apple dialog error (cancel, double-tap, in-progress) — silently return.
      // The server call in handleSocialLogin has its own error handling.
      return;
    }

    if (!credential.identityToken) {
      Alert.alert("Error", "Apple sign-in failed: no identity token");
      return;
    }

    const name = credential.fullName
      ? [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(" ") || undefined
      : undefined;

    // handleSocialLogin has its own error handling — don't wrap it
    await handleSocialLogin("apple", credential.identityToken, name);
  }, [handleSocialLogin]);

  return {
    signInWithGoogle,
    signInWithApple,
    loading,
  };
}
