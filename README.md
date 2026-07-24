# AI Chatbot Platform

Full-stack AI chatbot (ChatGPT/Claude/Gemini-style) — Next.js + Express + Prisma + PostgreSQL.

## Structure

```
apps/
  web/   Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, Framer Motion
  api/   Express, TypeScript, Prisma, PostgreSQL
```

## Getting started

```bash
# 1. Start local Postgres
docker compose up -d

# 2. Install deps
npm install

# 3. Configure env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# fill in DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, OAuth client IDs, etc.

# 4. Set up the database
npm run prisma:generate
npm run prisma:migrate

# 5. Run both apps
npm run dev
```

Web: http://localhost:3000  ·  API: http://localhost:4000

## AI providers

`apps/api/src/services/ai` implements a common `AIProvider` interface.

- **OpenAI** — fully implemented (streaming chat completions). Requires `OPENAI_API_KEY`.
- **Claude, Gemini, Groq, DeepSeek** — scaffolded behind the same interface, return a clear "not configured" response until API keys and SDK calls are filled in. Swap in real calls in each provider file without touching routes or frontend.

## Deployment target

- Frontend → Vercel
- Backend + Postgres → Railway

## Known dependency risk

`xlsx` (SheetJS) is used for `.xlsx` attachment parsing (`apps/api/src/services/file-parser.service.ts`) and has an upstream ReDoS/prototype-pollution advisory with no npm-registry fix available. It only runs against files a user uploads to their own account, but if you need a stronger guarantee, swap it for `exceljs` or gate `.xlsx` parsing behind a size/sanity check.

## What's stubbed

Payments/subscriptions, voice synthesis quality, OCR/background-removal/object-detection, and most non-OpenAI model providers are intentionally scaffolded but not fully implemented — see inline `// TODO` markers.
