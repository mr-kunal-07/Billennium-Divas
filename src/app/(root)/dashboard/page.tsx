"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import InvestorDashbord from "@/components/Investor/dashboard/InvestorDashbord";
import FounderDashbord from "@/components/Founder/dashboard/FounderDashbord";
import IPending from "@/components/Investor/dashboard/IPending";
import FPending from "@/components/Founder/dashboard/FPending";

export default function DashboardPage() {
  const router = useRouter();
  const { user, role, accountStatus, loading } = useUserRole();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!role) {
      // User exists but no founder/investor profile (edge case)
      router.push("/profile");
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return null; // Redirect in progress
  }

  if (role === "investor") {
    if (accountStatus === "pending") {
      return <IPending />;
    }
    return <InvestorDashbord />;
  }

  if (role === "founder") {
    if (accountStatus === "pending") {
      return <FPending />;
    }
    return <FounderDashbord />;
  }

  return null;
}
