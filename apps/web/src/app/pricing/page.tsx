"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

const plans = [
  { tier: "FREE", name: "Free", price: "$0", features: ["50 messages / day", "GPT-4o mini access", "3 saved chats"] },
  {
    tier: "PRO",
    name: "Pro",
    price: "$20",
    features: ["Unlimited messages", "All AI models", "Voice conversations", "Image generation & vision", "Unlimited chats & folders"],
    highlighted: true,
  },
  { tier: "TEAM", name: "Team", price: "$49/user", features: ["Everything in Pro", "Shared workspaces", "Admin analytics", "SSO & audit logs"] },
];

export default function PricingPage() {
  const [currentTier, setCurrentTier] = useState<string>("FREE");

  useEffect(() => {
    apiFetch<{ subscription: { tier: string } }>("/api/users/subscription").then((d) => setCurrentTier(d.subscription.tier));
  }, []);

  return (
    <AppShell>
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold mb-2">Plans & Pricing</h1>
        <p className="text-muted-foreground">Payments aren't wired up yet in this build — upgrades are illustrative only.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.tier} className={cn("relative", plan.highlighted && "border-primary shadow-lg")}>
            {plan.tier === currentTier && (
              <Badge variant="success" className="absolute -top-3 left-1/2 -translate-x-1/2">
                Current plan
              </Badge>
            )}
            <CardHeader>
              <h3 className="font-semibold">{plan.name}</h3>
              <div className="text-3xl font-bold">{plan.price}</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.highlighted ? "gradient" : "outline"}
                disabled={plan.tier === currentTier}
                onClick={() => toast.info("Payments aren't configured yet in this build.")}
              >
                {plan.tier === currentTier ? "Current plan" : `Switch to ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
