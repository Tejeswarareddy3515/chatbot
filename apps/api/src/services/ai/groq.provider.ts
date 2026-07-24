import { env } from "../../config/env";
import { createStubProvider } from "./stub.provider";

// TODO: replace with real groq-sdk streaming call once GROQ_API_KEY is set.
export const groqProvider = createStubProvider({
  id: "groq",
  name: "Groq",
  models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"],
  configured: Boolean(env.ai.groqApiKey),
  envVarName: "GROQ_API_KEY",
});
