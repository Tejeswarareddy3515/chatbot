"use client";
import { useEffect, useRef, useState } from "react";

let mermaidInitPromise: Promise<typeof import("mermaid")> | null = null;

function getMermaid() {
  if (!mermaidInitPromise) {
    mermaidInitPromise = import("mermaid").then((mod) => {
      mod.default.initialize({ startOnLoad: false, theme: "dark", securityLevel: "strict" });
      return mod;
    });
  }
  return mermaidInitPromise;
}

export function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    getMermaid()
      .then(async (mod) => {
        if (cancelled || !ref.current) return;
        try {
          const { svg } = await mod.default.render(idRef.current, code);
          if (!cancelled && ref.current) ref.current.innerHTML = svg;
        } catch (err) {
          if (!cancelled) setError((err as Error).message);
        }
      })
      .catch((err) => setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return <pre className="rounded-lg bg-secondary p-3 text-xs text-destructive">Mermaid render error: {error}</pre>;
  }

  return <div ref={ref} className="my-2 flex justify-center overflow-x-auto rounded-lg bg-white/5 p-4" />;
}
