import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { api } from "@/lib/trpc";
import { TalentflowLogo } from "@/components/TalentflowLogo";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resetMutation = api.auth.requestPasswordReset.useMutation();

  async function handleSubmit() {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetMutation.mutateAsync({ email });
      setSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 justify-center px-6">
          <View className="mb-4 items-center">
            <TalentflowLogo size={72} />
          </View>
          <Text className="mb-2 text-center font-bold text-3xl text-foreground">
            Check your email
          </Text>
          <Text className="mb-8 text-center font-sans text-base text-muted-foreground">
            If an account exists for {email}, we sent a password reset link.
            Open the link in your browser to reset your password.
          </Text>

          <Link href="/(auth)/login" asChild>
            <Pressable className="mt-4 items-center">
              <Text className="font-sans text-sm text-muted-foreground">
                Back to Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-4 items-center">
          <TalentflowLogo size={72} />
        </View>
        <Text className="mb-2 text-center font-bold text-3xl text-foreground">
          Forgot Password
        </Text>
        <Text className="mb-8 text-center font-sans text-base text-muted-foreground">
          Enter your email and we'll send you a reset link
        </Text>

        <TextInput
          className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError("");
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        {error ? (
          <Text className="mb-2 text-center font-sans text-sm text-destructive">
            {error}
          </Text>
        ) : null}

        <Pressable
          className={`mt-2 items-center rounded-xl bg-primary py-4 ${loading ? "opacity-60" : ""}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="font-medium text-base text-primary-foreground">
            {loading ? "Sending..." : "Send Reset Link"}
          </Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable className="mt-4 items-center">
            <Text className="font-sans text-sm text-muted-foreground">
              Back to Sign In
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
