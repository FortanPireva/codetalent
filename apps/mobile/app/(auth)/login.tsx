import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/theme";
import type { ThemeColors } from "@/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Talentflow</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.placeholder}
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
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError("");
          }}
          secureTextEntry
          autoComplete="password"
        />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <Link href="/(auth)/register" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>
              Don&apos;t have an account? Sign up
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Forgot your password?</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
    title: {
      fontSize: 32,
      fontFamily: "Satoshi-Bold",
      textAlign: "center",
      marginBottom: 8,
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 32,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      fontFamily: "Satoshi-Regular",
      marginBottom: 16,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 8,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: {
      color: colors.primaryText,
      fontSize: 16,
      fontFamily: "Satoshi-Medium",
    },
    errorText: {
      color: "#dc2626",
      fontSize: 14,
      fontFamily: "Satoshi-Regular",
      textAlign: "center",
      marginBottom: 8,
    },
    linkButton: { marginTop: 16, alignItems: "center" },
    linkText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontFamily: "Satoshi-Regular",
    },
  });
