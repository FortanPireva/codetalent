import { useMemo } from "react";
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
import { useTheme } from "@/theme";
import type { ThemeColors } from "@/theme";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: profile, isLoading, refetch, isRefetching } =
    api.auth.getProfile.useQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.text, fontFamily: "Satoshi-Regular" }}>
          Profile not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.textSecondary}
        />
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
        <InfoRow label="Availability" value={profile.availability} colors={colors} />
        {profile.location && (
          <InfoRow label="Location" value={profile.location} colors={colors} />
        )}
        {profile.phone && <InfoRow label="Phone" value={profile.phone} colors={colors} />}
        <InfoRow
          label="Assessments Passed"
          value={String(profile.passedAssessmentCount)}
          colors={colors}
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

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
      }}
    >
      <Text style={{ fontSize: 14, color: colors.textSecondary, fontFamily: "Satoshi-Regular" }}>
        {label}
      </Text>
      <Text style={{ fontSize: 14, fontFamily: "Satoshi-Medium", color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: { padding: 16 },
    header: { alignItems: "center", marginBottom: 24 },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    avatarText: {
      color: colors.primaryText,
      fontSize: 32,
      fontFamily: "Satoshi-Bold",
    },
    name: { fontSize: 22, fontFamily: "Satoshi-Bold", color: colors.text },
    email: {
      fontSize: 14,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      marginTop: 4,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Satoshi-Bold",
      marginBottom: 12,
      color: colors.text,
    },
    skills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    skillTag: {
      backgroundColor: colors.tag,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    skillText: { fontSize: 13, color: colors.textSecondary, fontFamily: "Satoshi-Medium" },
    bio: {
      fontSize: 14,
      fontFamily: "Satoshi-Regular",
      color: colors.textSecondary,
      lineHeight: 20,
    },
    logoutButton: {
      backgroundColor: colors.redBg,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 8,
      marginBottom: 32,
    },
    logoutText: {
      color: colors.red,
      fontSize: 16,
      fontFamily: "Satoshi-Medium",
    },
  });
