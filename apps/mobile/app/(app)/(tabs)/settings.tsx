import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";

const NOTIFICATION_KEYS = {
  assessmentResults: "notif_assessment_results",
  newJobMatches: "notif_new_job_matches",
  applicationUpdates: "notif_application_updates",
} as const;

type NotifKey = keyof typeof NOTIFICATION_KEYS;

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const c = useThemeColors();
  const { data: profile, isLoading, refetch, isRefetching } =
    api.auth.getProfile.useQuery();

  const [notifications, setNotifications] = useState({
    assessmentResults: true,
    newJobMatches: true,
    applicationUpdates: true,
  });

  // Sync preferences from server
  const { data: serverPrefs } = api.notification.getPreferences.useQuery(undefined, {
    staleTime: 30_000,
  });
  const updatePrefsMutation = api.notification.updatePreferences.useMutation();

  // Load from server when available, fallback to AsyncStorage
  useEffect(() => {
    if (serverPrefs) {
      const synced = {
        assessmentResults: serverPrefs.assessmentResults,
        newJobMatches: serverPrefs.newJobMatches,
        applicationUpdates: serverPrefs.applicationUpdates,
      };
      setNotifications(synced);
      // Cache locally
      for (const [key, storageKey] of Object.entries(NOTIFICATION_KEYS)) {
        AsyncStorage.setItem(storageKey, String(synced[key as NotifKey]));
      }
    } else {
      loadNotificationPrefs();
    }
  }, [serverPrefs]);

  async function loadNotificationPrefs() {
    const keys = Object.entries(NOTIFICATION_KEYS);
    for (const [key, storageKey] of keys) {
      const value = await AsyncStorage.getItem(storageKey);
      if (value !== null) {
        setNotifications((prev) => ({ ...prev, [key]: value === "true" }));
      }
    }
  }

  async function toggleNotification(key: NotifKey) {
    const newValue = !notifications[key];
    setNotifications((prev) => ({ ...prev, [key]: newValue }));
    await AsyncStorage.setItem(NOTIFICATION_KEYS[key], String(newValue));
    // Sync to server
    updatePrefsMutation.mutate({ [key]: newValue });
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.surface }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: c.surface }}
      contentContainerClassName="p-4 pb-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Profile Header */}
      <Pressable
        className="mb-4 flex-row items-center rounded-xl p-4"
        style={{ backgroundColor: c.card }}
        onPress={() => router.push("/(app)/profile")}
      >
        <View
          className="mr-3 h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: c.primary }}
        >
          <Text className="font-bold text-xl" style={{ color: c.primaryFg }}>
            {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-bold text-base" style={{ color: c.fg }}>
            {profile?.name ?? "User"}
          </Text>
          <Text className="mt-0.5 font-sans text-sm" style={{ color: c.mutedFg }}>
            {profile?.email}
          </Text>
        </View>
        <Text className="text-lg" style={{ color: c.mutedFg }}>›</Text>
      </Pressable>

      {/* Notifications */}
      <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Notifications
        </Text>
        <NotificationToggle
          label="Assessment Results"
          value={notifications.assessmentResults}
          onToggle={() => toggleNotification("assessmentResults")}
          colors={c}
        />
        <NotificationToggle
          label="New Job Matches"
          value={notifications.newJobMatches}
          onToggle={() => toggleNotification("newJobMatches")}
          colors={c}
        />
        <NotificationToggle
          label="Application Updates"
          value={notifications.applicationUpdates}
          onToggle={() => toggleNotification("applicationUpdates")}
          colors={c}
          isLast
        />
      </View>

      {/* Appearance */}
      <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Appearance
        </Text>
        <View className="flex-row gap-2">
          {(["light", "dark", "system"] as const).map((option) => (
            <Pressable
              key={option}
              className="flex-1 items-center rounded-lg py-2.5"
              style={{
                backgroundColor: theme === option ? c.primary : c.surface,
              }}
              onPress={() => setTheme(option)}
            >
              <Text
                className="font-medium text-sm capitalize"
                style={{
                  color: theme === option ? c.primaryFg : c.mutedFg,
                }}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Account */}
      <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: c.card }}>
        <Text className="mb-3 font-bold text-base" style={{ color: c.fg }}>
          Account
        </Text>
        <Pressable
          className="items-center rounded-xl py-3.5"
          style={{ backgroundColor: `${c.destructive}1A` }}
          onPress={logout}
        >
          <Text className="font-medium text-base" style={{ color: c.destructive }}>
            Sign Out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function NotificationToggle({
  label,
  value,
  onToggle,
  isLast,
  colors: c,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  isLast?: boolean;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Pressable
      className={`flex-row items-center justify-between py-3`}
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: c.borderLight } : undefined}
      onPress={onToggle}
    >
      <Text className="font-sans text-sm" style={{ color: c.fg }}>{label}</Text>
      <View
        className="h-7 w-12 justify-center rounded-full px-0.5"
        style={{ backgroundColor: value ? c.primary : c.toggleOff }}
      >
        <View
          className={`h-6 w-6 rounded-full bg-white shadow ${
            value ? "self-end" : "self-start"
          }`}
        />
      </View>
    </Pressable>
  );
}
