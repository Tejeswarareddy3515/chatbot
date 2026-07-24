import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../config/env";
import { AIProvider, GenerateOptions, StreamChunk } from "./provider.interface";

const client = env.ai.anthropicApiKey ? new Anthropic({ apiKey: env.ai.anthropicApiKey }) : null;

// Claude 4.6+ models (Opus 4.8, Sonnet 5) reject temperature/top_p with a 400.
// Only forward sampling params to the tiers that still accept them.
const SAMPLING_SAFE_MODELS = new Set(["claude-haiku-4-5"]);

export const claudeProvider: AIProvider = {
  id: "claude",
  name: "Claude",
  models: ["claude-opus-4-8", "claude-sonnet-5", "claude-haiku-4-5"],
  configured: Boolean(client),

  async *stream(options: GenerateOptions): AsyncGenerator<StreamChunk> {
    if (!client) {
      yield {
        delta: "Claude is not configured. Set ANTHROPIC_API_KEY in apps/api/.env to enable this provider.",
        done: true,
      };
      return;
    }

    // Anthropic keeps the system prompt as a top-level param, not a message role.
    const systemParts: string[] = [];
    if (options.systemPrompt) systemParts.push(options.systemPrompt);

    const messages: Anthropic.MessageParam[] = [];
    for (const m of options.messages) {
      if (m.role === "system") {
        systemParts.push(m.content);
        continue;
      }
      messages.push({ role: m.role, content: m.content });
    }

    // The Messages API requires the conversation to start with a user turn.
    if (messages.length === 0 || messages[0].role !== "user") {
      yield { delta: "", done: true };
      return;
    }

    const params: Anthropic.MessageStreamParams = {
      model: options.model,
      max_tokens: options.maxTokens ?? 2048,
      messages,
    };
    if (systemParts.length) params.system = systemParts.join("\n\n");
    if (SAMPLING_SAFE_MODELS.has(options.model) && options.temperature != null) {
      params.temperature = options.temperature;
    }

    const stream = client.messages.stream(params);
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield { delta: event.delta.text, done: false };
      }
    }
    yield { delta: "", done: true };
  },
};
