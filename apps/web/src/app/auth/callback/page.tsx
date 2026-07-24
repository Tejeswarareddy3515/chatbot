"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setToken } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setToken(token);
      hydrate().then(() => router.replace("/dashboard"));
    } else {
      router.replace("/login");
    }
  }, [params, router, hydrate]);

  return (
    <div className="flex h-screen items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      Signing you in…
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
