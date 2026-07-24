import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AnimatedBackground } from "@/components/landing/animated-background";
import BorderGlow from "@/components/ui/border-glow";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AnimatedBackground />
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Nexus AI
        </Link>
        <BorderGlow
          glowColor="35 95 60"
          backgroundColor="hsl(26 30% 8%)"
          borderRadius={20}
          glowRadius={36}
          glowIntensity={1}
          edgeSensitivity={26}
          coneSpread={22}
          fillOpacity={0.6}
          colors={["#f59e0b", "#fb923c", "#fbbf24"]}
        >
          <div className="p-8">
            <h1 className="text-2xl font-bold text-center mb-1">{title}</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">{subtitle}</p>
            {children}
          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
