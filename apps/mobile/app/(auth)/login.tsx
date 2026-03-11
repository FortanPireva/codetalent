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
import { TalentflowLogo } from "@/components/TalentflowLogo";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

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
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-4 items-center">
          <TalentflowLogo size={72} />
        </View>
        <Text className="mb-2 text-center font-bold text-3xl text-foreground">
          Talentflow
        </Text>
        <Text className="mb-8 text-center font-sans text-base text-muted-foreground">
          Sign in to your account
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
        <TextInput
          className="mb-4 rounded-xl border border-border bg-input-bg px-4 py-4 font-sans text-base text-foreground"
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError("");
          }}
          secureTextEntry
          autoComplete="password"
        />

        {error ? (
          <Text className="mb-2 text-center font-sans text-sm text-destructive">
            {error}
          </Text>
        ) : null}

        <Pressable
          className={`mt-2 items-center rounded-xl bg-primary py-4 ${loading ? "opacity-60" : ""}`}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="font-medium text-base text-primary-foreground">
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </Pressable>

        <Link href="/(auth)/register" asChild>
          <Pressable className="mt-4 items-center">
            <Text className="font-sans text-sm text-muted-foreground">
              Don't have an account? Sign up
            </Text>
          </Pressable>
        </Link>

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable className="mt-4 items-center">
            <Text className="font-sans text-sm text-muted-foreground">
              Forgot your password?
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
