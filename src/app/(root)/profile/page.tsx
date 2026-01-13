"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useMemo } from "react";
import { User, Mail, Phone, Building2, Calendar, MapPin } from "lucide-react";

/* ---------------- Types ---------------- */
interface ExtendedUser {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    companyName?: string;
    phone?: string;
    birthYear?: number;
    linkedin?: string;
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

export default function ProfilePage() {
    const { data: session, status } = useSession();

    // Loading state with skeleton
    if (status === "loading") {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    {/* Header Skeleton */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-64"></div>
                        </div>
                    </div>
                    {/* Content Skeleton */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Not authenticated → redirect
    if (!session?.user) {
        redirect("/login");
    }

    const user = session.user as ExtendedUser;
    const initials = useMemo(() => getInitials(user.name), [user.name]);
    const age = useMemo(() => calculateAge(user.birthYear), [user.birthYear]);

    return (
        <section className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-6 mb-8">
                {user.image ? (
                    <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-white"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {initials}
                    </div>
                )}

                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        {user.name || "User"}
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                    </p>
                    {user.role && (
                        <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-pink-100 text-pink-700 rounded-full">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                    )}
                </div>
            </div>

            {/* Profile Information Card */}
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
                        value={user.name}
                    />

                    <InfoItem
                        icon={<Mail className="w-4 h-4 text-gray-400" />}
                        label="Email"
                        value={user.email}
                    />

                    {user.phone && (
                        <InfoItem
                            icon={<Phone className="w-4 h-4 text-gray-400" />}
                            label="Phone"
                            value={user.phone}
                        />
                    )}

                    {age && (
                        <InfoItem
                            icon={<Calendar className="w-4 h-4 text-gray-400" />}
                            label="Age"
                            value={`${age} years`}
                        />
                    )}

                    {user.linkedin && (
                        <InfoItem
                            icon={<User className="w-4 h-4 text-gray-400" />}
                            label="LinkedIn"
                            value={
                                <a
                                    href={user.linkedin}
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

            {/* Company Information Card (if applicable) */}
            {user.companyName && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                            value={user.companyName}
                        />

                        <InfoItem
                            icon={<User className="w-4 h-4 text-gray-400" />}
                            label="Role"
                            value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "N/A"}
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
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

/* ---------------- Reusable Component ---------------- */
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
                <p className="text-sm font-medium text-gray-900 truncate">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}