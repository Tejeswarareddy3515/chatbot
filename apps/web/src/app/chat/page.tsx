"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useChatStore } from "@/store/chat.store";

export default function ChatIndexPage() {
  const router = useRouter();
  const createChat = useChatStore((s) => s.createChat);

  useEffect(() => {
    createChat().then((chat) => router.replace(`/chat/${chat.id}`));
  }, [createChat, router]);

  return (
    <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
      <Sparkles className="h-5 w-5 animate-pulse text-primary" /> Starting a new chat…
    </div>
  );
}
