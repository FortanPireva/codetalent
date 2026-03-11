import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/theme";
import type { ThemeColors } from "@/theme";

export default function OnboardingScreen() {
  const { logout } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📋</Text>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.description}>
        Please complete your onboarding on the web app to continue.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          const url = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
          Linking.openURL(`${url}/onboarding`);
        }}
      >
        <Text style={styles.buttonText}>Open Web App</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          logout().catch(() => {});
        }}
        hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      backgroundColor: colors.background,
    },
    icon: { fontSize: 48, marginBottom: 16 },
    title: {
      fontSize: 24,
      fontFamily: "Satoshi-Bold",
      marginBottom: 8,
      textAlign: "center",
      color: colors.text,
    },
    description: {
      fontSize: 16,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 22,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 32,
      paddingVertical: 14,
    },
    buttonText: { color: colors.primaryText, fontSize: 16, fontFamily: "Satoshi-Medium" },
    logoutButton: { marginTop: 16 },
    logoutText: { color: colors.textTertiary, fontSize: 14, fontFamily: "Satoshi-Regular" },
  });
