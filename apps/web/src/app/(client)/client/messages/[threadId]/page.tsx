"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { MessageComposer } from "@/components/messaging/MessageComposer";
import { ThreadDetailPanel } from "../_components/ThreadDetailPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PanelRightOpen, PanelRightClose } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

function formatDateSeparator(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

export default function ClientConversationPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { data: session } = useSession();
  const utils = api.useUtils();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showPanel, setShowPanel] = useState(true);

  const { data: threads } = api.messages.listThreads.useQuery();
  const thread = threads?.find((t) => t.threadId === threadId);

  const { data } = api.messages.getMessages.useQuery(
    { threadId },
    { refetchInterval: 4000 },
  );

  const sendMessage = api.messages.sendMessage.useMutation({
    onSuccess: () => {
      void utils.messages.getMessages.invalidate({ threadId });
      void utils.messages.listThreads.invalidate();
    },
  });

  const markRead = api.messages.markRead.useMutation({
    onSuccess: () => {
      void utils.messages.listThreads.invalidate();
    },
  });

  useEffect(() => {
    if (threadId) {
      markRead.mutate({ threadId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, data?.messages.length]);

  const messages = useMemo(
    () => [...(data?.messages ?? [])].reverse(),
    [data?.messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/client/messages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="font-semibold flex-1">
            {thread?.candidate?.name ?? "Conversation"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPanel((v) => !v)}
            title={showPanel ? "Hide details" : "Show details"}
          >
            {showPanel ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => {
            const isOwn = msg.senderId === session?.user?.id;
            const sentAt = new Date(msg.sentAt);
            const prevMsg = i > 0 ? messages[i - 1] : null;
            const showDateSep =
              !prevMsg ||
              format(new Date(prevMsg.sentAt), "yyyy-MM-dd") !==
                format(sentAt, "yyyy-MM-dd");

            return (
              <div key={msg.id}>
                {showDateSep && (
                  <div className="flex items-center justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {formatDateSeparator(sentAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      isOwn
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? "text-blue-100" : "text-muted-foreground"
                      }`}
                    >
                      {format(sentAt, "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <MessageComposer
          onSend={(body) => sendMessage.mutate({ threadId, body })}
          isSending={sendMessage.isPending}
        />
      </div>

      {/* Side panel */}
      {showPanel && <ThreadDetailPanel threadId={threadId} />}
    </div>
  );
}
