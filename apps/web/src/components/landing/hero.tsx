"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Sparkles, Github, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mainCode = `import { Nexus } from "nexus-ai";

const nexus = new Nexus({
  apiKey: "your-api-key",
});

const stream = await nexus.chat({
  model: "gpt-4o", // or claude, gemini
  messages: [
    { role: "user", content: "Review this PR" },
  ],
  stream: true,
});`;

const curlCode = `curl https://api.nexus.ai/v1/chat \\
  -H "authorization: Bearer $API_KEY" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role":"user"}]
  }'`;

// Lightweight, dependency-free syntax highlighting for the code cards.
// Single-pass tokenizer so replacements can't corrupt each other's markup.
// Only runs over these static, trusted snippets — never user input.
function highlight(code: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Comment (not the // inside https://) | double-quoted string | keyword
  const pattern = /(?<!:)(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|\b(import|from|const|new|await|return|true|false)\b/g;
  let out = "";
  let last = 0;
  for (let m = pattern.exec(code); m; m = pattern.exec(code)) {
    out += esc(code.slice(last, m.index));
    if (m[1]) out += `<span class="text-amber-500/50">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="text-emerald-300/90">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="text-orange-300">${esc(m[3])}</span>`;
    last = m.index + m[0].length;
  }
  out += esc(code.slice(last));
  return out;
}

const stats = [
  { value: "5+", label: "AI Models" },
  { value: "<300ms", label: "First token" },
  { value: "24/7", label: "Access" },
];

function CodeCard({ code, filename, className = "" }: { code: string; filename: string; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-amber-500/25 bg-[#1c1408]/85 p-5 shadow-[0_0_60px_-15px_rgba(245,158,11,0.5)] backdrop-blur-xl ${className}`}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-red-400/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
        <span className="h-3 w-3 rounded-full bg-green-400/70" />
        <span className="ml-2 font-mono text-xs text-amber-200/40">{filename}</span>
      </div>
      <pre className="overflow-x-auto font-mono text-[12.5px] leading-6 text-zinc-300 scrollbar-thin">
        <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </pre>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-16 pb-28">
      {/* Warm background: god-ray light beam + radial glows + grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 -top-48 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-amber-500/20 blur-[130px]" />
        <div className="absolute left-[58%] -top-24 h-[150%] w-[380px] -translate-x-1/2 rotate-[20deg] bg-gradient-to-b from-amber-400/25 via-amber-500/5 to-transparent blur-2xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-orange-600/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="container grid items-center gap-16 lg:grid-cols-2">
        {/* Left — copy */}
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="gradient" className="mb-6 gap-1.5 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5" /> GPT · Claude · Gemini · Groq · DeepSeek
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
          >
            One assistant,
            <br />
            every model,
            <br />
            <span className="text-gradient">one workspace.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg text-muted-foreground"
          >
            Chat, code, search, and create with every major AI model — streamed in real time.
            Switch models mid-conversation. Never lose context.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Button size="lg" variant="gradient" asChild>
              <Link href="/register">
                <KeyRound className="h-4 w-4" /> Start chatting free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#pricing">
                View pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex items-center gap-6"
          >
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6">
                {i > 0 && <div className="h-10 w-px bg-border" />}
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — floating code cards with connector + glow */}
        <div className="relative hidden h-[520px] lg:block">
          {/* connector line + node */}
          <svg className="absolute left-0 top-1/2 h-64 w-32 -translate-y-1/2" viewBox="0 0 120 240" fill="none" aria-hidden>
            <path d="M0 120 H60 V40" stroke="url(#wire)" strokeWidth="1.5" />
            <circle cx="60" cy="40" r="4" fill="hsl(var(--primary))" />
            <defs>
              <linearGradient id="wire" x1="0" y1="0" x2="120" y2="240" gradientUnits="userSpaceOnUse">
                <stop stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="absolute right-24 top-4 w-72 animate-float [animation-delay:1s]"
          >
            <CodeCard code={curlCode} filename="request.sh" className="opacity-80" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="absolute right-0 top-40 w-[26rem] animate-float"
          >
            <CodeCard code={mainCode} filename="chat.ts" />
          </motion.div>

          {/* floating social chips */}
          <div className="absolute -right-4 top-1/2 flex -translate-y-1/2 flex-col gap-3">
            <a
              href="#"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg shadow-primary/30 transition hover:scale-105"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg shadow-primary/30 transition hover:scale-105"
              aria-label="Community"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
