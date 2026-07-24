"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Settings2, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModelSelector } from "./model-selector";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ChatInput } from "./chat-input";
import { apiFetch, apiUrl } from "@/lib/api";
import { useChatStream } from "@/hooks/useChatStream";
import { Chat, Message } from "@/types/chat";

export function ChatWindow({ chatId }: { chatId: string }) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { runStream, stop, isStreaming, streamingContent } = useChatStream({
    onMessageComplete: (message) => {
      setMessages((prev) => [...prev, message]);
    },
  });

  useEffect(() => {
    setLoading(true);
    apiFetch<{ chat: Chat; messages: Message[] }>(`/api/chats/${chatId}`)
      .then((data) => {
        setChat(data.chat);
        setMessages(data.messages);
      })
      .catch(() => toast.error("Failed to load chat"))
      .finally(() => setLoading(false));
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingContent]);

  async function handleSend(content: string) {
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      chatId,
      role: "USER",
      content,
      isPinned: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    await runStream("/api/messages", { chatId, content }).catch((err) => toast.error(err.message));
  }

  async function handleRegenerate() {
    await runStream(`/api/messages/${chatId}/regenerate`).catch((err) => toast.error(err.message));
    setMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => m.role === "ASSISTANT");
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      return prev.slice(0, realIdx);
    });
  }

  async function handlePin(messageId: string) {
    const data = await apiFetch<{ message: Message }>(`/api/messages/${messageId}/pin`, { method: "PATCH" });
    setMessages((prev) => prev.map((m) => (m.id === messageId ? data.message : m)));
  }

  async function handleModelChange(model: string) {
    if (!chat) return;
    await apiFetch(`/api/chats/${chatId}`, { method: "PATCH", body: JSON.stringify({ model }) });
    setChat({ ...chat, model });
  }

  async function handleFileUpload(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("chatId", chatId);
    toast.promise(apiFetch("/api/files/upload", { method: "POST", body: form }), {
      loading: `Uploading ${file.name}…`,
      success: `${file.name} uploaded — ask a question about it`,
      error: "Upload failed",
    });
  }

  function handleShare() {
    apiFetch<{ shareUrl: string }>(`/api/chats/${chatId}/share`, { method: "POST" }).then((data) => {
      navigator.clipboard.writeText(`${window.location.origin}${data.shareUrl}`);
      toast.success("Share link copied to clipboard");
    });
  }

  function handleExport(format: "markdown" | "txt" | "json") {
    window.open(apiUrl(`/api/chats/${chatId}/export?format=${format}`), "_blank");
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading chat…</div>;
  }

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate font-medium text-sm">{chat?.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {chat && <ModelSelector value={chat.model} onChange={handleModelChange} />}
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("markdown")}>Export as Markdown</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("txt")}>Export as TXT</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4">
        <div className="mx-auto max-w-3xl divide-y divide-border/50">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 mb-3 text-primary" />
              <p className="font-medium">Start a new conversation</p>
              <p className="text-sm">Ask anything — switch models anytime from the top bar.</p>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              onPin={() => handlePin(m.id)}
              onRegenerate={m.role === "ASSISTANT" ? handleRegenerate : undefined}
            />
          ))}
          {isStreaming &&
            (streamingContent ? (
              <MessageBubble
                message={{
                  id: "streaming",
                  chatId,
                  role: "ASSISTANT",
                  content: streamingContent,
                  isPinned: false,
                  createdAt: new Date().toISOString(),
                }}
              />
            ) : (
              <TypingIndicator />
            ))}
        </div>
      </div>

      <ChatInput onSend={handleSend} onStop={stop} isStreaming={isStreaming} onFileUpload={handleFileUpload} />
    </div>
  );
}
