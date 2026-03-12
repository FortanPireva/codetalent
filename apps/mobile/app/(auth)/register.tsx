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
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { TalentflowLogo } from "@/components/TalentflowLogo";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const registerMutation = api.auth.register.useMutation();
  const { loginWithToken } = useAuth();
  const c = useThemeColors();

  async function handleRegister() {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await registerMutation.mutateAsync({
        name,
        email,
        password,
        role: "CANDIDATE",
      });
      await loginWithToken(result.token, result.user);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      if (message.includes("CONFLICT") || message.includes("already exists")) {
        setError("An account with this email already exists");
      } else {
        setError(message);
      }
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
          Create Account
        </Text>
        <Text className="mb-8 text-center font-sans text-base" style={{ color: c.mutedFg }}>
          Join Talentflow as a candidate
        </Text>

        <TextInput
          className="mb-4 rounded-xl px-4 py-4 font-sans text-base"
          style={{
            backgroundColor: c.inputBg,
            borderColor: c.border,
            borderWidth: 1,
            color: c.fg,
          }}
          placeholder="Full Name"
          placeholderTextColor={c.placeholder}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError("");
          }}
          autoComplete="name"
        />
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
          placeholder="Password (min 8 characters)"
          placeholderTextColor={c.placeholder}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError("");
          }}
          secureTextEntry
          autoComplete="new-password"
        />

        {error ? (
          <Text className="mb-2 text-center font-sans text-sm" style={{ color: c.destructive }}>
            {error}
          </Text>
        ) : null}

        <Pressable
          className={`mt-2 items-center rounded-xl py-4 ${loading ? "opacity-60" : ""}`}
          style={{ backgroundColor: c.primary }}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text className="font-medium text-base" style={{ color: c.primaryFg }}>
            {loading ? "Creating account..." : "Sign Up"}
          </Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable className="mt-4 items-center">
            <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
              Already have an account? Sign in
            </Text>
          </Pressable>
        </Link>

        <Link href="/(auth)/welcome" asChild>
          <Pressable className="mt-6 items-center">
            <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
              Learn more about Talentflow
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
