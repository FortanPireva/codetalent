import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
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
  const [text, setText] = useState("");
  const utils = api.useUtils();
  const flatListRef = useRef<FlatList>(null);

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
