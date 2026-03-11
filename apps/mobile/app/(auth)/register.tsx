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
import { TalentflowLogo } from "@/components/TalentflowLogo";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const registerMutation = api.auth.register.useMutation();
  const { loginWithToken } = useAuth();

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
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-4 items-center">
          <TalentflowLogo size={72} />
        </View>
        <Text className="mb-2 text-center font-bold text-3xl text-foreground">
          Create Account
        </Text>
        <Text className="mb-8 text-center font-sans text-base text-muted-foreground">
          Join Talentflow as a candidate
        </Text>

        <TextInput
          className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError("");
          }}
          autoComplete="name"
        />
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
        <TextInput
          className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
          placeholder="Password (min 8 characters)"
          placeholderTextColor="#999"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError("");
          }}
          secureTextEntry
          autoComplete="new-password"
        />

        {error ? (
          <Text className="mb-2 text-center font-sans text-sm text-destructive">
            {error}
          </Text>
        ) : null}

        <Pressable
          className={`mt-2 items-center rounded-xl bg-primary py-4 ${loading ? "opacity-60" : ""}`}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text className="font-medium text-base text-primary-foreground">
            {loading ? "Creating account..." : "Sign Up"}
          </Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable className="mt-4 items-center">
            <Text className="font-sans text-sm text-muted-foreground">
              Already have an account? Sign in
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
