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
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { TalentflowLogo } from "@/components/TalentflowLogo";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const c = useThemeColors();

  async function handleLogin() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message.includes("UNAUTHORIZED") ? "Invalid email or password" : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: c.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-4 items-center">
          <TalentflowLogo size={72} />
        </View>
        <Text className="mb-2 text-center font-bold text-3xl" style={{ color: c.fg }}>
          Talentflow
        </Text>
        <Text className="mb-8 text-center font-sans text-base" style={{ color: c.mutedFg }}>
          Sign in to your account
        </Text>

        <TextInput
          className="mb-4 rounded-xl px-4 py-4 font-sans text-base"
          style={{
            backgroundColor: c.inputBg,
            borderColor: c.border,
            borderWidth: 1,
            color: c.fg,
          }}
          placeholder="Email"
          placeholderTextColor={c.placeholder}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError("");
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          className="mb-4 rounded-xl px-4 py-4 font-sans text-base"
          style={{
            backgroundColor: c.inputBg,
            borderColor: c.border,
            borderWidth: 1,
            color: c.fg,
          }}
          placeholder="Password"
          placeholderTextColor={c.placeholder}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError("");
          }}
          secureTextEntry
          autoComplete="password"
        />

        {error ? (
          <Text className="mb-2 text-center font-sans text-sm" style={{ color: c.destructive }}>
            {error}
          </Text>
        ) : null}

        <Pressable
          className={`mt-2 items-center rounded-xl py-4 ${loading ? "opacity-60" : ""}`}
          style={{ backgroundColor: c.primary }}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="font-medium text-base" style={{ color: c.primaryFg }}>
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </Pressable>

        <Link href="/(auth)/register" asChild>
          <Pressable className="mt-4 items-center">
            <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
              Don't have an account? Sign up
            </Text>
          </Pressable>
        </Link>

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable className="mt-4 items-center">
            <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
              Forgot your password?
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
