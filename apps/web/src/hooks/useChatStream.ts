"use client";
import { useCallback, useRef, useState } from "react";
import { API_URL } from "@/lib/api";
import { Message } from "@/types/chat";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

interface UseChatStreamOptions {
  onMessageComplete?: (message: Message) => void;
}

/**
 * Drives a Server-Sent-Events POST stream from the backend (fetch doesn't support
 * EventSource for POST bodies, so this parses the `event:`/`data:` frames manually).
 */
export function useChatStream(options: UseChatStreamOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const runStream = useCallback(
    async (url: string, body?: unknown) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);
      setStreamingContent("");

      try {
        const res = await fetch(`${API_URL}${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
          },
          credentials: "include",
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: "Stream failed" }));
          throw new Error(err.error ?? "Stream failed");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let content = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const eventMatch = frame.match(/^event: (.+)$/m);
            const dataMatch = frame.match(/^data: (.+)$/m);
            if (!eventMatch || !dataMatch) continue;

            const event = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (event === "chunk") {
              content += data.delta;
              setStreamingContent(content);
            } else if (event === "done") {
              options.onMessageComplete?.(data.message);
            } else if (event === "error") {
              throw new Error(data.message);
            }
          }
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [options]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { runStream, stop, isStreaming, streamingContent };
}
