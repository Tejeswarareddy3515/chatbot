import { AuthGuard } from "@/components/shared/auth-guard";
import { Sidebar } from "@/components/chat/sidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        {children}
      </div>
    </AuthGuard>
  );
}
