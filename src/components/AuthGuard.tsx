"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, role, loading } = useUserRole();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!role) {
      router.replace("/profile");
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  return <>{children}</>;
}
