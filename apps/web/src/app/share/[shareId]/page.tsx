"use client";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { apiFetch } from "@/lib/api";
import { Chat, Message } from "@/types/chat";

export default function SharedChatPage({ params }: { params: { shareId: string } }) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch<{ chat: Chat; messages: Message[] }>(`/api/chats/shared/${params.shareId}`)
      .then((data) => {
        setChat(data.chat);
        setMessages(data.messages);
      })
      .catch(() => setError(true));
  }, [params.shareId]);

  if (error) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">This shared chat is unavailable.</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-border px-4 py-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">{chat?.title ?? "Shared chat"}</span>
      </div>
      <div className="mx-auto max-w-3xl px-4 divide-y divide-border/50">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>
    </div>
  );
}
