"use client";
import { useState } from "react";
import { Copy, Check, RotateCcw, Volume2, Pin, User, Sparkles } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useSpeechSynthesis } from "@/hooks/useSpeech";

export function MessageBubble({
  message,
  onRegenerate,
  onPin,
}: {
  message: Message;
  onRegenerate?: () => void;
  onPin?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { speak, stop, speaking } = useSpeechSynthesis();
  const isUser = message.role === "USER";

  function handleCopy() {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cn("group flex gap-3 py-4", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-secondary" : "bg-brand-gradient"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-white" />}
      </div>

      <div className={cn("flex max-w-[75%] flex-col gap-1.5", isUser && "items-end")}>
        <div className={cn("rounded-2xl px-4 py-2.5", isUser ? "bg-primary text-primary-foreground" : "bg-secondary")}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
          {message.tokenCount != null && <span>{message.tokenCount} tokens</span>}
          {message.model && <span>· {message.model}</span>}
          <button onClick={handleCopy} className="hover:text-foreground">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          {!isUser && (
            <button onClick={() => (speaking ? stop() : speak(message.content))} className="hover:text-foreground">
              <Volume2 className={cn("h-3.5 w-3.5", speaking && "text-primary")} />
            </button>
          )}
          {onPin && (
            <button onClick={onPin} className="hover:text-foreground">
              <Pin className={cn("h-3.5 w-3.5", message.isPinned && "text-primary fill-primary")} />
            </button>
          )}
          {!isUser && onRegenerate && (
            <button onClick={onRegenerate} className="hover:text-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
