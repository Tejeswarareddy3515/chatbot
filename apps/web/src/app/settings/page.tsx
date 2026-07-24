"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

interface Settings {
  theme: string;
  defaultModel: string;
  voiceName: string;
  voiceSpeed: number;
  voicePitch: number;
  webSearchEnabled: boolean;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [customInstructions, setCustomInstructions] = useState("");
  const [name, setName] = useState(user?.name ?? "");

  useEffect(() => {
    apiFetch<{ settings: Settings }>("/api/users/settings").then((d) => setSettings(d.settings));
  }, []);

  async function saveSettings(patch: Partial<Settings>) {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    await apiFetch("/api/users/settings", { method: "PATCH", body: JSON.stringify(patch) });
    if (patch.theme) setTheme(patch.theme);
    toast.success("Settings saved");
  }

  async function saveProfile() {
    await apiFetch("/api/users/profile", { method: "PATCH", body: JSON.stringify({ name, customInstructions }) });
    toast.success("Profile updated");
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="ai">AI Defaults</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your display name and custom instructions the AI should always follow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Custom instructions</Label>
                <Textarea
                  rows={5}
                  placeholder="e.g. Always answer concisely. I'm a backend engineer, prefer Python examples."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                />
              </div>
              <Button variant="gradient" onClick={saveProfile}>
                Save changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose your preferred theme.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-sm space-y-4">
              <Label>Theme</Label>
              <Select value={settings?.theme} onValueChange={(v) => saveSettings({ theme: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Defaults</CardTitle>
              <CardDescription>Set the default model and behavior for new chats.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-sm space-y-4">
              <div className="space-y-2">
                <Label>Default model</Label>
                <Input
                  value={settings?.defaultModel ?? ""}
                  onChange={(e) => setSettings(settings ? { ...settings, defaultModel: e.target.value } : settings)}
                  onBlur={(e) => saveSettings({ defaultModel: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Web search</Label>
                  <p className="text-xs text-muted-foreground">Allow the AI to search the web for current information.</p>
                </div>
                <Switch checked={settings?.webSearchEnabled ?? false} onCheckedChange={(v) => saveSettings({ webSearchEnabled: v })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice</CardTitle>
              <CardDescription>Tune text-to-speech playback for assistant replies.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-sm space-y-6">
              <div className="space-y-2">
                <Label>Speed ({settings?.voiceSpeed.toFixed(2)}x)</Label>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={[settings?.voiceSpeed ?? 1]}
                  onValueChange={([v]) => setSettings(settings ? { ...settings, voiceSpeed: v } : settings)}
                  onValueCommit={([v]) => saveSettings({ voiceSpeed: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Pitch ({settings?.voicePitch.toFixed(2)})</Label>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={[settings?.voicePitch ?? 1]}
                  onValueChange={([v]) => setSettings(settings ? { ...settings, voicePitch: v } : settings)}
                  onValueCommit={([v]) => saveSettings({ voicePitch: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
