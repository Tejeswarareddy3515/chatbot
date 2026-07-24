import { AIProvider, GenerateOptions, StreamChunk } from "./provider.interface";

/**
 * Factory for providers whose SDK integration hasn't been wired up yet.
 * Once an API key + SDK call are added, replace the returned provider's
 * `stream` implementation with a real one (mirror openai.provider.ts).
 */
export function createStubProvider(params: {
  id: string;
  name: string;
  models: string[];
  configured: boolean;
  envVarName: string;
}): AIProvider {
  return {
    id: params.id,
    name: params.name,
    models: params.models,
    configured: params.configured,
    async *stream(_options: GenerateOptions): AsyncGenerator<StreamChunk> {
      yield {
        delta: params.configured
          ? `${params.name} integration is scaffolded but not yet implemented. Add the SDK call in services/ai/${params.id}.provider.ts.`
          : `${params.name} is not configured. Set ${params.envVarName} in apps/api/.env to enable this provider.`,
        done: true,
      };
    },
  };
}
