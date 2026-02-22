"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { Loader2 } from "lucide-react";

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

/**
 * Redirects to /dashboard if the user is logged in.
 * Use on public pages: landing (/), /register, /login.
 */
export default function RedirectIfAuthenticated({
  children,
}: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });
    return unsubscribe;
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
      </div>
    );
  }

  return <>{children}</>;
}
