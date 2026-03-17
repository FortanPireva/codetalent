import { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Flag } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { timeAgo } from "@/lib/timeAgo";

export default function ConversationScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const { user } = useAuth();
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const [text, setText] = useState("");
  const utils = api.useUtils();
  const flatListRef = useRef<FlatList>(null);

  const { data: threadDetail } = api.messages.getThreadDetail.useQuery(
    { threadId: threadId! },
    { enabled: !!threadId },
  );
  const reportMutation = api.moderation.reportUser.useMutation();
  const blockMutation = api.moderation.blockUser.useMutation();

  useLayoutEffect(() => {
    if (!threadDetail?.otherPartyUserId) return;
    const otherUserId = threadDetail.otherPartyUserId;

    navigation.setOptions({
      headerRight: () => (
        <Pressable
          className="mr-2 p-2"
          onPress={() => {
            Alert.alert("Moderation", "Choose an action", [
              {
                text: "Report User",
                onPress: () => {
                  Alert.alert("Report Reason", "Why are you reporting this user?", [
                    {
                      text: "Spam",
                      onPress: () => {
                        reportMutation.mutate(
                          { reportedUserId: otherUserId, reason: "SPAM", contentType: "MESSAGE" },
                          { onSuccess: () => Alert.alert("Reported", "Thank you for your report. We will review it.") },
                        );
                      },
                    },
                    {
                      text: "Harassment",
                      onPress: () => {
                        reportMutation.mutate(
                          { reportedUserId: otherUserId, reason: "HARASSMENT", contentType: "MESSAGE" },
                          { onSuccess: () => Alert.alert("Reported", "Thank you for your report. We will review it.") },
                        );
                      },
                    },
                    {
                      text: "Inappropriate",
                      onPress: () => {
                        reportMutation.mutate(
                          { reportedUserId: otherUserId, reason: "INAPPROPRIATE", contentType: "MESSAGE" },
                          { onSuccess: () => Alert.alert("Reported", "Thank you for your report. We will review it.") },
                        );
                      },
                    },
                    {
                      text: "Other",
                      onPress: () => {
                        reportMutation.mutate(
                          { reportedUserId: otherUserId, reason: "OTHER", contentType: "MESSAGE" },
                          { onSuccess: () => Alert.alert("Reported", "Thank you for your report. We will review it.") },
                        );
                      },
                    },
                    { text: "Cancel", style: "cancel" },
                  ]);
                },
              },
              {
                text: "Block User",
                style: "destructive",
                onPress: () => {
                  Alert.alert(
                    "Block User",
                    "You will no longer see messages from this user. Are you sure?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Block",
                        style: "destructive",
                        onPress: () => {
                          blockMutation.mutate(
                            { blockedUserId: otherUserId },
                            {
                              onSuccess: () => {
                                utils.messages.listThreads.invalidate();
                                Alert.alert("Blocked", "User has been blocked.");
                                router.back();
                              },
                            },
                          );
                        },
                      },
                    ],
                  );
                },
              },
              { text: "Cancel", style: "cancel" },
            ]);
          }}
        >
          <Flag size={20} color={c.mutedFg} />
        </Pressable>
      ),
    });
  }, [threadDetail?.otherPartyUserId, navigation, c.mutedFg]);

  const {
    data,
    isLoading,
  } = api.messages.getMessages.useQuery(
    { threadId: threadId! },
    { enabled: !!threadId, refetchInterval: 4_000 },
  );

  const sendMutation = api.messages.sendMessage.useMutation({
    onSuccess: () => {
      setText("");
      utils.messages.getMessages.invalidate({ threadId: threadId! });
      utils.messages.listThreads.invalidate();
    },
  });

  const markReadMutation = api.messages.markRead.useMutation();

  // Mark as read on mount and when message count changes
  const messageCount = data?.messages?.length ?? 0;
  useEffect(() => {
    if (threadId) {
      markReadMutation.mutate({ threadId });
    }
  }, [threadId, messageCount]);

  const handleSend = () => {
    const body = text.trim();
    if (!body || !threadId) return;
    sendMutation.mutate({ threadId, body });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.surface }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const messages = data?.messages ?? [];

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: c.surface }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}
    >
      <FlatList
        ref={flatListRef}
        className="flex-1 px-4"
        inverted
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View className="items-center p-8">
            <Text className="font-sans text-sm" style={{ color: c.mutedFg }}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isOwn = item.senderId === user?.id;
          return (
            <View
              className={`mb-2 max-w-[80%] ${isOwn ? "self-end" : "self-start"}`}
            >
              <View
                className="rounded-2xl px-4 py-2.5"
                style={{
                  backgroundColor: isOwn ? "#3b82f6" : c.card,
                }}
              >
                <Text
                  className="font-sans text-sm leading-5"
                  style={{ color: isOwn ? "#FFFFFF" : c.fg }}
                >
                  {item.body}
                </Text>
              </View>
              <Text
                className={`mt-1 font-sans text-xs ${isOwn ? "text-right" : "text-left"}`}
                style={{ color: c.mutedFg }}
              >
                {timeAgo(item.sentAt)}
              </Text>
            </View>
          );
        }}
      />

      {/* Input Area */}
      <View
        className="flex-row items-end gap-2 border-t px-4 py-3"
        style={{
          borderTopColor: c.borderLight,
          backgroundColor: c.bg,
          paddingBottom: Math.max(insets.bottom, 12),
        }}
      >
        <TextInput
          className="max-h-24 min-h-[40px] flex-1 rounded-xl px-4 py-2.5 font-sans text-sm"
          style={{
            backgroundColor: c.inputBg,
            color: c.fg,
            borderWidth: 1,
            borderColor: c.borderLight,
          }}
          placeholder="Type a message..."
          placeholderTextColor={c.placeholder}
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="center"
        />
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: text.trim() ? c.primary : c.toggleOff,
          }}
          onPress={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
        >
          <Text style={{ color: text.trim() ? c.primaryFg : c.mutedFg, fontSize: 16 }}>
            ↑
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
