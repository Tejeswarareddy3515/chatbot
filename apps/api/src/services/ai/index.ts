import { AIProvider } from "./provider.interface";
import { openaiProvider } from "./openai.provider";
import { claudeProvider } from "./claude.provider";
import { geminiProvider } from "./gemini.provider";
import { groqProvider } from "./groq.provider";
import { deepseekProvider } from "./deepseek.provider";

export const providers: AIProvider[] = [openaiProvider, claudeProvider, geminiProvider, groqProvider, deepseekProvider];

const modelToProvider = new Map<string, AIProvider>();
for (const provider of providers) {
  for (const model of provider.models) {
    modelToProvider.set(model, provider);
  }
}

export function getProviderForModel(model: string): AIProvider {
  return modelToProvider.get(model) ?? openaiProvider;
}

export function listAvailableModels() {
  return providers.map((p) => ({
    provider: p.id,
    name: p.name,
    configured: p.configured,
    models: p.models,
  }));
}

export * from "./provider.interface";
