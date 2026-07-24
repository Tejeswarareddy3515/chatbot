"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  Search,
  Pin,
  Star,
  Folder as FolderIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Settings,
  LogOut,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { Chat } from "@/types/chat";

function ChatRow({ chat, active }: { chat: Chat; active: boolean }) {
  const router = useRouter();
  const { renameChat, deleteChat, togglePin, toggleFavorite } = useChatStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title);

  async function commitRename() {
    setEditing(false);
    if (title.trim() && title !== chat.title) await renameChat(chat.id, title.trim());
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm cursor-pointer hover:bg-secondary",
        active && "bg-secondary font-medium"
      )}
      onClick={() => !editing && router.push(`/chat/${chat.id}`)}
    >
      {editing ? (
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => e.key === "Enter" && commitRename()}
          onClick={(e) => e.stopPropagation()}
          className="h-7 px-1.5 text-sm"
        />
      ) : (
        <span className="flex-1 truncate">{chat.title}</span>
      )}

      {chat.isPinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
      {chat.isFavorite && <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="opacity-0 group-hover:opacity-100 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => togglePin(chat.id)}>
            <Pin className="h-4 w-4 mr-2" /> {chat.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleFavorite(chat.id)}>
            <Star className="h-4 w-4 mr-2" /> {chat.isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => deleteChat(chat.id)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function Sidebar() {
  const params = useParams();
  const activeId = params?.chatId as string | undefined;
  const { chats, folders, search, setSearch, fetchChats, fetchFolders, createChat } = useChatStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchChats();
    fetchFolders();
  }, [fetchChats, fetchFolders]);

  const filtered = useMemo(
    () => chats.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())),
    [chats, search]
  );

  const pinned = filtered.filter((c) => c.isPinned);
  const favorites = filtered.filter((c) => c.isFavorite && !c.isPinned);
  const rest = filtered.filter((c) => !c.isPinned && !c.isFavorite);

  async function handleNewChat() {
    const chat = await createChat();
    router.push(`/chat/${chat.id}`);
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-secondary/20">
      <div className="p-3">
        <Button variant="gradient" className="w-full" onClick={handleNewChat}>
          <Plus className="h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search chats…" className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-4 pb-3">
        {folders.length > 0 && (
          <div>
            <div className="px-1.5 py-1 text-xs font-semibold text-muted-foreground">Folders</div>
            {folders.map((f) => (
              <div key={f.id} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-secondary cursor-pointer">
                <FolderIcon className="h-3.5 w-3.5" />
                {f.name}
                <span className="ml-auto text-xs text-muted-foreground">{f._count?.chats ?? 0}</span>
              </div>
            ))}
          </div>
        )}

        {pinned.length > 0 && (
          <div>
            <div className="px-1.5 py-1 text-xs font-semibold text-muted-foreground">Pinned</div>
            {pinned.map((c) => (
              <ChatRow key={c.id} chat={c} active={c.id === activeId} />
            ))}
          </div>
        )}

        {favorites.length > 0 && (
          <div>
            <div className="px-1.5 py-1 text-xs font-semibold text-muted-foreground">Favorites</div>
            {favorites.map((c) => (
              <ChatRow key={c.id} chat={c} active={c.id === activeId} />
            ))}
          </div>
        )}

        <div>
          <div className="px-1.5 py-1 text-xs font-semibold text-muted-foreground">Recent</div>
          {rest.map((c) => (
            <ChatRow key={c.id} chat={c} active={c.id === activeId} />
          ))}
          {filtered.length === 0 && <div className="px-2 py-4 text-center text-sm text-muted-foreground">No chats yet</div>}
        </div>
      </div>

      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-secondary">
              <Avatar className="h-8 w-8">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? user?.email[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <div className="truncate text-sm font-medium">{user?.name ?? user?.email}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <Sparkles className="h-4 w-4 mr-2" /> Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="h-4 w-4 mr-2" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/history">
                <History className="h-4 w-4 mr-2" /> History
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Link>
            </DropdownMenuItem>
            {user?.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <ShieldCheck className="h-4 w-4 mr-2" /> Admin Panel
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => logout().then(() => router.push("/"))}>
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
