import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/trpc";

// Lazy-load expo-notifications to avoid crash in Expo Go
let Notifications: typeof import("expo-notifications") | null = null;
let Device: typeof import("expo-device") | null = null;

try {
  Notifications = require("expo-notifications");
  Device = require("expo-device");

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowInForeground: true,
    }),
  });
} catch {
  console.log("expo-notifications not available (Expo Go?)");
}

export function useNotifications(enabled: boolean = true) {
  const router = useRouter();
  const notificationListener = useRef<{ remove: () => void }>();
  const responseListener = useRef<{ remove: () => void }>();
  const registered = useRef(false);

  const registerMutation = api.notification.registerPushToken.useMutation();

  useEffect(() => {
    if (!enabled || registered.current || !Notifications || !Device) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        registered.current = true;
        registerMutation.mutate({
          token,
          platform: Platform.OS as "ios" | "android",
        });
      }
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // Notification received in foreground — UI can react via unreadCount query
      });

    // Listen for notification tap responses
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.type === "JOB_MATCH" && data.jobId) {
          router.push(`/(app)/(tabs)/jobs/${data.jobId as string}`);
        } else if (data?.type === "APPLICATION_STATUS_CHANGE") {
          router.push("/(app)/(tabs)/applications");
        } else if (data?.type === "ASSESSMENT_RESULT") {
          router.push("/(app)/(tabs)/assessments");
        } else {
          router.push("/(app)/notifications");
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [enabled]);
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Notifications || !Device) return null;

  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "2820e468-7ebd-4193-be82-b334ec1c6c13",
  });

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return tokenData.data;
}
