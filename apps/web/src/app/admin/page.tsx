"use client";
import { useEffect, useState } from "react";
import { Users, MessagesSquare, Bot, DollarSign } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

interface Overview {
  totalUsers: number;
  totalChats: number;
  totalMessages: number;
  subscriptionsByTier: { tier: string; _count: number }[];
  modelUsage: { model: string | null; _count: number }[];
  revenue: { mrr: number; currency: string; note: string };
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  subscription: { tier: string } | null;
  _count: { chats: number };
}

export default function AdminPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    apiFetch<Overview>("/api/admin/overview").then(setOverview);
    apiFetch<{ users: AdminUser[] }>("/api/admin/users").then((d) => setUsers(d.users));
  }, []);

  return (
    <AppShell adminOnly>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{overview?.totalUsers ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Total users</div>
            </div>
            <Users className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{overview?.totalChats ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Total chats</div>
            </div>
            <MessagesSquare className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{overview?.totalMessages ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Total messages</div>
            </div>
            <Bot className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">${overview?.revenue.mrr ?? 0}</div>
              <div className="text-sm text-muted-foreground">MRR ({overview?.revenue.note})</div>
            </div>
            <DollarSign className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="usage">Model usage</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Plan</th>
                      <th className="py-2 pr-4">Chats</th>
                      <th className="py-2 pr-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border/50">
                        <td className="py-2 pr-4">{u.email}</td>
                        <td className="py-2 pr-4">{u.name ?? "—"}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={u.role === "ADMIN" ? "gradient" : "outline"}>{u.role}</Badge>
                        </td>
                        <td className="py-2 pr-4">{u.subscription?.tier ?? "FREE"}</td>
                        <td className="py-2 pr-4">{u._count.chats}</td>
                        <td className="py-2 pr-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Model usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overview?.modelUsage.map((m) => (
                <div key={m.model} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50">
                  <span>{m.model}</span>
                  <span className="text-muted-foreground">{m._count} messages</span>
                </div>
              ))}
              {!overview?.modelUsage.length && <p className="text-sm text-muted-foreground">No usage yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
