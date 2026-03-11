import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function OnboardingScreen() {
  const { logout } = useAuth();

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

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#fff" },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  description: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 24, lineHeight: 22 },
  button: { backgroundColor: "#000", borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  logoutButton: { marginTop: 16 },
  logoutText: { color: "#999", fontSize: 14 },
});
