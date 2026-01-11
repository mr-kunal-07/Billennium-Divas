"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useMemo } from "react";

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

export default function ProfilePage() {
    const { data: session, status } = useSession();

    // 🚫 While loading, avoid flicker
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <p className="text-gray-500 text-sm">Loading profile...</p>
            </div>
        );
    }

    // 🔒 Not authenticated → redirect
    if (!session?.user) {
        redirect("/login");
    }

    const user = session.user;

    const initials = useMemo(
        () => getInitials(user.name),
        [user.name]
    );

    return (
        <section className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white text-xl font-semibold shadow-md">
                    {initials}
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {user.name ?? "User"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {user.email}
                    </p>
                </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Profile Information
                    </h2>
                </div>

                <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Full Name</p>
                        <p className="text-sm font-medium text-gray-800">
                            {user.name ?? "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-800">
                            {user.email ?? "-"}
                        </p>
                    </div>

                    {/* Optional: If you store phone in session */}
                    {"phone" in user && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Phone</p>
                            <p className="text-sm font-medium text-gray-800">
                                {(user as any).phone ?? "-"}
                            </p>
                        </div>
                    )}

                    <div>
                        <p className="text-xs text-gray-500 mb-1">Account Type</p>
                        <p className="text-sm font-medium text-gray-800">
                            Authenticated User
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
