import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";
import { AIProvider, GenerateOptions, StreamChunk } from "./provider.interface";

const client = env.ai.geminiApiKey ? new GoogleGenAI({ apiKey: env.ai.geminiApiKey }) : null;

export const geminiProvider: AIProvider = {
  id: "gemini",
  name: "Gemini",
  models: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"],
  configured: Boolean(client),

  async *stream(options: GenerateOptions): AsyncGenerator<StreamChunk> {
    if (!client) {
      yield {
        delta: "Gemini is not configured. Set GEMINI_API_KEY in apps/api/.env to enable this provider.",
        done: true,
      };
      return;
    }

    // Gemini keeps the system prompt in config.systemInstruction, and uses the
    // "model" role (not "assistant") for prior assistant turns.
    const systemParts: string[] = [];
    if (options.systemPrompt) systemParts.push(options.systemPrompt);

    const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];
    for (const m of options.messages) {
      if (m.role === "system") {
        systemParts.push(m.content);
        continue;
      }
      contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] });
    }

    const stream = await client.models.generateContentStream({
      model: options.model,
      contents,
      config: {
        ...(systemParts.length ? { systemInstruction: systemParts.join("\n\n") } : {}),
        temperature: options.temperature,
        topP: options.topP,
        maxOutputTokens: options.maxTokens,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) yield { delta: text, done: false };
    }
    yield { delta: "", done: true };
  },
};
