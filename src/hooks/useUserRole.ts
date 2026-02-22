"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export type UserRole = "founder" | "investor" | null;

export interface FounderProfile {
  uid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  name?: string;
  companyName?: string;
  companyStage?: string;
  roundSize?: number;
  pitchDeck?: string;
  pitchVideo?: string;
  role?: string;
  [key: string]: unknown;
}

export interface InvestorProfile {
  uid: string;
  name?: string;
  email?: string;
  type?: string;
  investmentSector?: string;
  fundSize?: number;
  role?: string;
  [key: string]: unknown;
}

export interface UseUserRoleResult {
  user: User | null;
  role: UserRole;
  profile: FounderProfile | InvestorProfile | null;
  accountStatus: "pending" | "approved";
  loading: boolean;
}

/**
 * Resolves the current user's role from Firebase Auth + Firestore.
 * Checks founders collection first, then investors.
 * accountStatus defaults to "approved" when not set (for backward compatibility).
 */
export function useUserRole(): UseUserRoleResult {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [profile, setProfile] = useState<FounderProfile | InvestorProfile | null>(null);
  const [accountStatus, setAccountStatus] = useState<"pending" | "approved">("approved");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setRole(null);
        setProfile(null);
        setAccountStatus("approved");
        setLoading(false);
        return;
      }

      try {
        // Check founders first
        const founderSnap = await getDoc(doc(db, "founders", firebaseUser.uid));
        if (founderSnap.exists()) {
          const data = founderSnap.data() as Record<string, unknown>;
          setRole("founder");
          setProfile({
            uid: firebaseUser.uid,
            ...data,
            name: (data.firstName && data.lastName)
              ? `${data.firstName} ${data.lastName}`
              : (data.name as string) || firebaseUser.displayName,
          } as FounderProfile);
          const status = data.accountStatus as string | undefined;
          setAccountStatus(status === "pending" ? "pending" : "approved");
          setLoading(false);
          return;
        }

        // Then check investors
        const investorSnap = await getDoc(doc(db, "investors", firebaseUser.uid));
        if (investorSnap.exists()) {
          const data = investorSnap.data() as Record<string, unknown>;
          setRole("investor");
          setProfile({
            uid: firebaseUser.uid,
            ...data,
          } as InvestorProfile);
          const status = data.accountStatus as string | undefined;
          setAccountStatus(status === "pending" ? "pending" : "approved");
          setLoading(false);
          return;
        }

        setRole(null);
        setProfile(null);
        setAccountStatus("approved");
      } catch (err) {
        console.error("useUserRole:", err);
        setRole(null);
        setProfile(null);
        setAccountStatus("approved");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return { user, role, profile, accountStatus, loading };
}
