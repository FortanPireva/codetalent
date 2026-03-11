import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingScreen() {
  const { logout } = useAuth();

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

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#fff" },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  description: { fontSize: 16, color: "#666", textAlign: "center", lineHeight: 22 },
  logoutButton: { marginTop: 24 },
  logoutText: { color: "#999", fontSize: 14 },
});
