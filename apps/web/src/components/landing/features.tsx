"use client";
import { motion } from "framer-motion";
import {
  MessagesSquare,
  Code2,
  Mic,
  Image as ImageIcon,
  FileSearch,
  Globe2,
  BrainCircuit,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: MessagesSquare, title: "Multi-model chat", desc: "Switch between GPT, Claude, Gemini, Groq, and DeepSeek mid-conversation." },
  { icon: Code2, title: "Built for developers", desc: "Syntax-highlighted code, explain/refactor/debug/test-generate on demand." },
  { icon: ImageIcon, title: "Vision & image generation", desc: "Generate and analyze images, OCR documents, and understand screenshots." },
  { icon: Mic, title: "Voice conversations", desc: "Natural speech-to-text and text-to-speech with adjustable voice, speed, and pitch." },
  { icon: FileSearch, title: "Document Q&A", desc: "Upload PDFs, Word, Excel, CSV, and ask questions grounded in your files." },
  { icon: Globe2, title: "Live web search", desc: "Pull in fresh results from the web, Wikipedia, GitHub, arXiv, and more." },
  { icon: BrainCircuit, title: "Custom instructions", desc: "Persistent memory, system prompts, and per-chat temperature & context controls." },
  { icon: ShieldCheck, title: "Secure by default", desc: "JWT auth, rate limiting, input sanitization, and encrypted credentials." },
];

export function Features() {
  return (
    <section id="features" className="py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything you need in one place</h2>
          <p className="mt-4 text-muted-foreground">A complete AI workspace — not just a chat window.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-gradient">
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
