"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "Which AI models can I use?", a: "Nexus AI supports OpenAI GPT, Anthropic Claude, Google Gemini, Groq, and DeepSeek. You can switch models per-chat or mid-conversation." },
  { q: "Can I bring my own API keys?", a: "Yes — add your own provider keys in Settings to use your own rate limits and billing instead of ours." },
  { q: "Is my data private?", a: "Your conversations are encrypted in transit, access is protected with JWT auth, and you can delete any chat or export your data at any time." },
  { q: "Does it support file uploads?", a: "Yes — upload PDFs, Word, Excel, PowerPoint, CSV, JSON, images, audio, video, and ZIP files for the AI to read and answer questions about." },
  { q: "Can I cancel anytime?", a: "Yes, subscriptions are month-to-month with no long-term commitment." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-28 bg-secondary/30">
      <div className="container max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left font-medium"
              >
                {faq.q}
                <ChevronDown className={cn("h-4 w-4 transition-transform shrink-0", open === i && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-4 text-sm text-muted-foreground">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
