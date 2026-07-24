import { create } from "zustand";
import { apiFetch } from "@/lib/api";
import { Chat, Folder } from "@/types/chat";

interface ChatState {
  chats: Chat[];
  folders: Folder[];
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  fetchChats: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  createChat: (model?: string) => Promise<Chat>;
  renameChat: (id: string, title: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  moveToFolder: (chatId: string, folderId: string | null) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  folders: [],
  loading: false,
  search: "",

  setSearch: (search) => set({ search }),

  fetchChats: async () => {
    set({ loading: true });
    try {
      const data = await apiFetch<{ chats: Chat[] }>("/api/chats");
      set({ chats: data.chats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchFolders: async () => {
    const data = await apiFetch<{ folders: Folder[] }>("/api/folders");
    set({ folders: data.folders });
  },

  createChat: async (model) => {
    const data = await apiFetch<{ chat: Chat }>("/api/chats", {
      method: "POST",
      body: JSON.stringify({ model }),
    });
    set({ chats: [data.chat, ...get().chats] });
    return data.chat;
  },

  renameChat: async (id, title) => {
    await apiFetch(`/api/chats/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });
    set({ chats: get().chats.map((c) => (c.id === id ? { ...c, title } : c)) });
  },

  deleteChat: async (id) => {
    await apiFetch(`/api/chats/${id}`, { method: "DELETE" });
    set({ chats: get().chats.filter((c) => c.id !== id) });
  },

  togglePin: async (id) => {
    const chat = get().chats.find((c) => c.id === id);
    if (!chat) return;
    await apiFetch(`/api/chats/${id}`, { method: "PATCH", body: JSON.stringify({ isPinned: !chat.isPinned }) });
    set({ chats: get().chats.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c)) });
  },

  toggleFavorite: async (id) => {
    const chat = get().chats.find((c) => c.id === id);
    if (!chat) return;
    await apiFetch(`/api/chats/${id}`, { method: "PATCH", body: JSON.stringify({ isFavorite: !chat.isFavorite }) });
    set({ chats: get().chats.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c)) });
  },

  createFolder: async (name) => {
    const data = await apiFetch<{ folder: Folder }>("/api/folders", { method: "POST", body: JSON.stringify({ name }) });
    set({ folders: [...get().folders, data.folder] });
  },

  moveToFolder: async (chatId, folderId) => {
    await apiFetch(`/api/chats/${chatId}`, { method: "PATCH", body: JSON.stringify({ folderId }) });
    set({ chats: get().chats.map((c) => (c.id === chatId ? { ...c, folderId } : c)) });
  },
}));
