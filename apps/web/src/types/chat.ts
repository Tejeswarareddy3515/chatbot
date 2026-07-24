export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  model?: string | null;
  tokenCount?: number | null;
  isPinned: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  folderId: string | null;
  model: string;
  systemPrompt: string | null;
  temperature: number;
  topP: number;
  maxTokens: number;
  isPinned: boolean;
  isFavorite: boolean;
  isShared: boolean;
  shareId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  _count?: { chats: number };
}

export interface ModelProviderInfo {
  provider: string;
  name: string;
  configured: boolean;
  models: string[];
}
