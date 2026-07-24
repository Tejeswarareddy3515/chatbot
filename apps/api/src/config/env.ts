import dotenv from "dotenv";

dotenv.config();

// Collect every missing variable before failing, so a deploy log shows the
// whole list at once instead of one-per-restart.
const missing: string[] = [];

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    missing.push(name);
    return "";
  }
  return value;
}

function assertNoMissing(): void {
  if (missing.length === 0) return;
  console.error(
    [
      "",
      "═══ Startup aborted: required environment variables are not set ═══",
      ...missing.map((n) => `  • ${n}`),
      "",
      "On Vercel, set these under Project → Settings → Environment Variables.",
      "DATABASE_URL should be a pooled Postgres connection string.",
      "",
    ].join("\n")
  );
  throw new Error(`Missing required env vars: ${missing.join(", ")}`);
}

// CLIENT_URL accepts a comma-separated list so one deployment can serve the
// apex domain, the www subdomain, and the *.vercel.app URL. The first entry is
// the canonical one used for OAuth redirects; all of them are allowed by CORS.
const clientUrls = required("CLIENT_URL", "http://localhost:3000")
  .split(",")
  .map((u) => u.trim().replace(/\/$/, ""))
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  clientUrl: clientUrls[0] ?? "http://localhost:3000",
  allowedOrigins: clientUrls,

  databaseUrl: required("DATABASE_URL"),

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "",
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID ?? "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    callbackUrl: process.env.GITHUB_CALLBACK_URL ?? "",
  },

  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
    geminiApiKey: process.env.GEMINI_API_KEY ?? "",
    groqApiKey: process.env.GROQ_API_KEY ?? "",
    deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? "",
  },
};

assertNoMissing();
