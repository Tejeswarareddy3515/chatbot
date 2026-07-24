"use client";
import Link from "next/link";
import { Mail, ShieldCheck, Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 text-xl">
              {user?.avatarUrl && <AvatarImage src={user.avatarUrl} />}
              <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? user?.email[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.name ?? "Unnamed user"}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" /> {user?.email}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            Role <Badge variant="secondary">{user?.role}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" /> Member since account creation
          </div>
          <Button variant="outline" asChild>
            <Link href="/settings">Edit profile & preferences</Link>
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
