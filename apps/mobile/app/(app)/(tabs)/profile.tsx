import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { api } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { data: profile, isLoading, refetch, isRefetching } =
    api.auth.getProfile.useQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <InfoRow label="Availability" value={profile.availability} />
        {profile.location && (
          <InfoRow label="Location" value={profile.location} />
        )}
        {profile.phone && <InfoRow label="Phone" value={profile.phone} />}
        <InfoRow
          label="Assessments Passed"
          value={String(profile.passedAssessmentCount)}
        />
      </View>

      {profile.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skills}>
            {profile.skills.map((skill) => (
              <View key={skill} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {profile.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16 },
  header: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  name: { fontSize: 22, fontWeight: "bold" },
  email: { fontSize: 14, color: "#666", marginTop: 4 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, fontWeight: "500" },
  skills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillTag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skillText: { fontSize: 13, color: "#333" },
  bio: { fontSize: 14, color: "#444", lineHeight: 20 },
  logoutButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  logoutText: { color: "#dc2626", fontSize: 16, fontWeight: "600" },
});
