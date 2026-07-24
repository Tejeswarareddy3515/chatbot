"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star, Pin, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat.store";

export default function HistoryPage() {
  const { chats, fetchChats, deleteChat } = useChatStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const filtered = useMemo(() => {
    return chats
      .filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
      .filter((c) => (tab === "pinned" ? c.isPinned : tab === "favorites" ? c.isFavorite : true))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [chats, query, tab]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Chat history</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search all chats…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pinned">Pinned</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((chat) => (
          <Card key={chat.id}>
            <CardContent className="flex items-center justify-between py-4">
              <Link href={`/chat/${chat.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{chat.title}</span>
                  {chat.isPinned && <Pin className="h-3.5 w-3.5 text-primary shrink-0" />}
                  {chat.isFavorite && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />}
                </div>
                <div className="text-xs text-muted-foreground">
                  {chat.model} · Updated {new Date(chat.updatedAt).toLocaleString()}
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => deleteChat(chat.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-16">No chats match your filters.</p>}
      </div>
    </AppShell>
  );
}
