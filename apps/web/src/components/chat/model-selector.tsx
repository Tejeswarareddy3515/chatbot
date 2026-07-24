"use client";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { ModelProviderInfo } from "@/types/chat";

export function ModelSelector({ value, onChange }: { value: string; onChange: (model: string) => void }) {
  const [providers, setProviders] = useState<ModelProviderInfo[]>([]);

  useEffect(() => {
    apiFetch<{ providers: ModelProviderInfo[] }>("/api/models")
      .then((data) => setProviders(data.providers))
      .catch(() => {});
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-56 h-9">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {providers.map((provider) => (
          <div key={provider.provider}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
              {provider.name}
              {!provider.configured && (
                <Badge variant="outline" className="text-[10px] py-0">
                  Not configured
                </Badge>
              )}
            </div>
            {provider.models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
