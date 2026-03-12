import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { db } from "@/server/db";
import { type NotificationType } from "@codetalent/db";
import type { Prisma } from "@prisma/client";

const expo = new Expo();

const TYPE_TO_PREFERENCE: Record<
  NotificationType,
  "assessmentResults" | "newJobMatches" | "applicationUpdates"
> = {
  JOB_MATCH: "newJobMatches",
  APPLICATION_STATUS_CHANGE: "applicationUpdates",
  ASSESSMENT_RESULT: "assessmentResults",
  CONTRACT_UPDATE: "applicationUpdates",
  MILESTONE_APPROVAL: "applicationUpdates",
};

interface SendNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendNotification({
  userId,
  type,
  title,
  body,
  data,
}: SendNotificationInput) {
  // Always persist the notification record
  const notification = await db.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: (data ?? undefined) as Prisma.InputJsonValue | undefined,
      sentAt: new Date(),
    },
  });

  // Check user preference
  const prefField = TYPE_TO_PREFERENCE[type];
  const preference = await db.notificationPreference.findUnique({
    where: { userId },
  });

  // If preference exists and the relevant field is disabled, skip push
  if (preference && !preference[prefField]) {
    return notification;
  }

  // Get push tokens
  const tokens = await db.pushToken.findMany({
    where: { userId },
    select: { token: true },
  });

  if (tokens.length === 0) {
    return notification;
  }

  const messages: ExpoPushMessage[] = tokens
    .filter(({ token }: { token: string }) => Expo.isExpoPushToken(token))
    .map(({ token }: { token: string }) => ({
      to: token,
      sound: "default" as const,
      title,
      body,
      data: { ...data, notificationId: notification.id, type },
    }));

  if (messages.length > 0) {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error("Error sending push notification chunk:", error);
      }
    }
  }

  return notification;
}

export async function sendBulkNotifications(
  notifications: SendNotificationInput[]
) {
  if (notifications.length === 0) return { created: 0, pushed: 0 };

  // Persist all notification records
  const created = await db.notification.createMany({
    data: notifications.map((n) => ({
      userId: n.userId,
      type: n.type,
      title: n.title,
      body: n.body,
      data: (n.data ?? undefined) as Prisma.InputJsonValue | undefined,
      sentAt: new Date(),
    })),
  });

  // Gather unique user IDs
  const userIds = [...new Set(notifications.map((n) => n.userId))];

  // Fetch preferences and tokens for all users
  const [preferences, allTokens] = await Promise.all([
    db.notificationPreference.findMany({
      where: { userId: { in: userIds } },
    }),
    db.pushToken.findMany({
      where: { userId: { in: userIds } },
    }),
  ]);

  const prefMap = new Map(preferences.map((p) => [p.userId, p]));
  const tokenMap = new Map<string, string[]>();
  for (const t of allTokens) {
    if (!tokenMap.has(t.userId)) tokenMap.set(t.userId, []);
    tokenMap.get(t.userId)!.push(t.token);
  }

  // Build push messages
  const messages: ExpoPushMessage[] = [];
  for (const n of notifications) {
    const prefField = TYPE_TO_PREFERENCE[n.type];
    const pref = prefMap.get(n.userId);
    if (pref && !pref[prefField]) continue;

    const tokens = tokenMap.get(n.userId) ?? [];
    for (const token of tokens) {
      if (!Expo.isExpoPushToken(token)) continue;
      messages.push({
        to: token,
        sound: "default" as const,
        title: n.title,
        body: n.body,
        data: { ...n.data, type: n.type },
      });
    }
  }

  // Send in chunks of 100
  let pushed = 0;
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
      pushed += chunk.length;
    } catch (error) {
      console.error("Error sending bulk push notifications:", error);
    }
  }

  return { created: created.count, pushed };
}
