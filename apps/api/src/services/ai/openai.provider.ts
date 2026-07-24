import OpenAI from "openai";
import { env } from "../../config/env";
import { AIProvider, GenerateOptions, StreamChunk } from "./provider.interface";

const client = env.ai.openaiApiKey ? new OpenAI({ apiKey: env.ai.openaiApiKey }) : null;

export const openaiProvider: AIProvider = {
  id: "openai",
  name: "OpenAI",
  models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-mini"],
  configured: Boolean(client),

  async *stream(options: GenerateOptions): AsyncGenerator<StreamChunk> {
    if (!client) {
      yield { delta: "OpenAI is not configured. Set OPENAI_API_KEY in apps/api/.env to enable this model.", done: true };
      return;
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    for (const m of options.messages) {
      messages.push({ role: m.role, content: m.content });
    }

    const completion = await client.chat.completions.create({
      model: options.model,
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 1,
      max_tokens: options.maxTokens ?? 2048,
      stream: true,
    });

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) {
        yield { delta, done: false };
      }
    }
    yield { delta: "", done: true };
  },
};
