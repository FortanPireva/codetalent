import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/theme";
import type { ThemeColors } from "@/theme";

export default function PendingScreen() {
  const { logout } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⏳</Text>
      <Text style={styles.title}>Under Review</Text>
      <Text style={styles.description}>
        Your profile is being reviewed by our team. We&apos;ll notify you once
        it&apos;s approved.
      </Text>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => { logout().catch(() => {}); }}
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
      lineHeight: 22,
    },
    logoutButton: { marginTop: 24 },
    logoutText: { color: colors.textTertiary, fontSize: 14, fontFamily: "Satoshi-Regular" },
  });
