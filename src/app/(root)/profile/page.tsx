"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { User, Mail, Phone, Building2, Calendar, MapPin, Linkedin } from "lucide-react";

/* ---------------- Types ---------------- */
interface FounderProfile {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  companyName?: string;
  phone?: string;
  birthYear?: number;
  linkedin?: string;
  location?: string;
}

/* ---------------- Helpers ---------------- */
const getInitials = (name?: string | null) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const calculateAge = (birthYear?: number) => {
  if (!birthYear) return null;
  return new Date().getFullYear() - birthYear;
};

/* ---------------- Page ---------------- */
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FounderProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setStatus("unauthenticated");
        return;
      }

      try {
        // Fetch extended profile from founders/{uid}
        const snap = await getDoc(doc(db, "founders", firebaseUser.uid));
        const firestoreData = snap.exists() ? (snap.data() as FounderProfile) : {};

        // Merge Firebase Auth base fields with Firestore profile
        setProfile({
          name:        firestoreData.name        ?? firebaseUser.displayName,
          email:       firestoreData.email       ?? firebaseUser.email,
          image:       firestoreData.image       ?? firebaseUser.photoURL,
          role:        firestoreData.role,
          companyName: firestoreData.companyName,
          phone:       firestoreData.phone       ?? firebaseUser.phoneNumber ?? undefined,
          birthYear:   firestoreData.birthYear,
          linkedin:    firestoreData.linkedin,
          location:    firestoreData.location,
        });
        setStatus("authenticated");
      } catch (err) {
        console.error("Failed to fetch founder profile:", err);
        // Fall back to Auth-only data so the page still renders
        setProfile({
          name:  firebaseUser.displayName,
          email: firebaseUser.email,
          image: firebaseUser.photoURL,
          phone: firebaseUser.phoneNumber ?? undefined,
        });
        setStatus("authenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  /* ── Loading skeleton ── */
  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-64" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Unauthenticated (redirect in-flight) ── */
  if (!profile) return null;

  const initials = getInitials(profile.name);
  const age      = calculateAge(profile.birthYear);

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-6 mb-8">
        {profile.image ? (
          <img
            src={profile.image}
            alt={profile.name || "User"}
            className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-white"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {initials}
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {profile.name || "User"}
          </h1>
          <p className="text-gray-600 flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4" />
            {profile.email}
          </p>
          {profile.role && (
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-pink-100 text-pink-700 rounded-full">
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* ── Personal Information ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h2>
        </div>

        <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InfoItem
            icon={<User className="w-4 h-4 text-gray-400" />}
            label="Full Name"
            value={profile.name}
          />
          <InfoItem
            icon={<Mail className="w-4 h-4 text-gray-400" />}
            label="Email"
            value={profile.email}
          />
          {profile.phone && (
            <InfoItem
              icon={<Phone className="w-4 h-4 text-gray-400" />}
              label="Phone"
              value={profile.phone}
            />
          )}
          {age && (
            <InfoItem
              icon={<Calendar className="w-4 h-4 text-gray-400" />}
              label="Age"
              value={`${age} years`}
            />
          )}
          {profile.location && (
            <InfoItem
              icon={<MapPin className="w-4 h-4 text-gray-400" />}
              label="Location"
              value={profile.location}
            />
          )}
          {profile.linkedin && (
            <InfoItem
              icon={<Linkedin className="w-4 h-4 text-gray-400" />}
              label="LinkedIn"
              value={
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 hover:underline"
                >
                  View Profile
                </a>
              }
            />
          )}
        </div>
      </div>

      {/* ── Company Information ── */}
      {profile.companyName && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </h2>
          </div>

          <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoItem
              icon={<Building2 className="w-4 h-4 text-gray-400" />}
              label="Company Name"
              value={profile.companyName}
            />
            <InfoItem
              icon={<User className="w-4 h-4 text-gray-400" />}
              label="Role"
              value={
                profile.role
                  ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="mt-8 flex gap-4">
        <button className="px-6 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
          Edit Profile
        </button>
        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">
          Settings
        </button>
      </div>
    </section>
  );
}

/* ---------------- Reusable InfoItem ---------------- */
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null | React.ReactNode;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <div className="text-sm font-medium text-gray-900 truncate">
          {value || "-"}
        </div>
      </div>
    </div>
  );
}