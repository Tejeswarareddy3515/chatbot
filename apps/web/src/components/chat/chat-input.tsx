"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, Paperclip, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeech";
import { toast } from "sonner";

const MAX_LENGTH = 32000;

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  onFileUpload,
}: {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  onFileUpload?: (file: File) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { start, stop, listening, transcript, supported } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setValue(transcript);
  }, [transcript]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const tokenEstimate = Math.ceil(value.length / 4);

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onFileUpload) onFileUpload(file);
              e.target.value = "";
            }}
          />
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder="Message Nexus AI…"
            rows={1}
            className="min-h-0 flex-1 resize-none border-0 bg-transparent px-1 py-1.5 focus-visible:ring-0 shadow-none"
          />

          <Button
            variant="ghost"
            size="icon"
            className={cn("shrink-0", listening && "text-destructive")}
            onClick={() => {
              if (!supported) return toast.error("Voice input isn't supported in this browser");
              listening ? stop() : start();
            }}
          >
            <Mic className="h-4 w-4" />
          </Button>

          {isStreaming ? (
            <Button variant="destructive" size="icon" className="shrink-0" onClick={onStop}>
              <Square className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="gradient" size="icon" className="shrink-0" onClick={handleSubmit} disabled={!value.trim()}>
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-1.5 flex justify-between px-1 text-xs text-muted-foreground">
          <span>{isStreaming && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Generating…</span>}</span>
          <span>{tokenEstimate} tokens · Enter to send, Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
}
