export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GenerateOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  configured: boolean;
  stream(options: GenerateOptions): AsyncGenerator<StreamChunk>;
}
