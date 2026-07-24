import { env } from "../../config/env";
import { createStubProvider } from "./stub.provider";

// TODO: DeepSeek's API is OpenAI-compatible — point the OpenAI SDK's baseURL at
// https://api.deepseek.com and reuse openai.provider.ts's logic once DEEPSEEK_API_KEY is set.
export const deepseekProvider = createStubProvider({
  id: "deepseek",
  name: "DeepSeek",
  models: ["deepseek-chat", "deepseek-reasoner"],
  configured: Boolean(env.ai.deepseekApiKey),
  envVarName: "DEEPSEEK_API_KEY",
});
