"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Sparkles, Star, Pin, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Subscription {
  tier: "FREE" | "PRO" | "TEAM";
  status: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { chats, fetchChats, createChat } = useChatStore();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchChats();
    apiFetch<{ subscription: Subscription }>("/api/users/subscription").then((d) => setSubscription(d.subscription));
  }, [fetchChats]);

  async function handleNewChat() {
    const chat = await createChat();
    router.push(`/chat/${chat.id}`);
  }

  const pinnedCount = chats.filter((c) => c.isPinned).length;
  const favoriteCount = chats.filter((c) => c.isFavorite).length;

  return (
    <AppShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋</h1>
          <p className="text-muted-foreground text-sm">Here's what's happening across your workspace.</p>
        </div>
        <Button variant="gradient" onClick={handleNewChat}>
          <Plus className="h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{chats.length}</div>
              <div className="text-sm text-muted-foreground">Total chats</div>
            </div>
            <MessageSquare className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{pinnedCount}</div>
              <div className="text-sm text-muted-foreground">Pinned</div>
            </div>
            <Pin className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{favoriteCount}</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </div>
            <Star className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold capitalize">{subscription?.tier.toLowerCase() ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Current plan</div>
            </div>
            <Sparkles className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent chats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {chats.slice(0, 8).map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-secondary transition-colors"
            >
              <span className="truncate text-sm font-medium">{chat.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">{chat.model}</span>
            </Link>
          ))}
          {chats.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No chats yet — start your first conversation.</p>}
        </CardContent>
      </Card>
    </AppShell>
  );
}
