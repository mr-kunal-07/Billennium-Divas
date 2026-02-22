"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Building, User, LucideIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

// ==== TYPES ====
interface RoleType {
    id: "investor" | "founder";
    icon: LucideIcon;
    title: string;
    description: string;
    route: string;
}

// ==== DATA ====
const ROLES: RoleType[] = [
    {
        id: "investor",
        icon: User,
        title: "I am Investor",
        description: "Explore startup pitches, invest smartly, support innovation.",
        route: "/investor-signup",
    },
    {
        id: "founder",
        icon: Building,
        title: "I am Founder",
        description: "Pitch your idea, find investors, grow your startup.",
        route: "/founder-signup",
    },
];

// ==== COMPONENTS ====
interface RoleCardProps {
    role: RoleType;
    isSelected: boolean;
    onSelect: (role: RoleType) => void;
}

const RoleCard = ({ role, isSelected, onSelect }: RoleCardProps) => {
    const Icon = role.icon;
    return (
        <button
            onClick={() => onSelect(role)}
            className={`bg-white border-2 rounded-2xl px-10 py-8 shadow-sm hover:shadow-lg 
                transition-all duration-300 hover:-translate-y-1
                flex flex-col items-center text-center w-72
                ${isSelected
                    ? "border-pink-400 ring-2 ring-pink-300 bg-pink-50/30"
                    : "border-pink-100 hover:border-pink-200"
                }`}
            aria-label={`Select ${role.title}`}
        >
            <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
          ${isSelected ? "bg-pink-100" : "bg-pink-50"}`}
            >
                <Icon className={`text-3xl ${isSelected ? "text-pink-500" : "text-pink-400"}`} />
            </div>
            <p className="text-xl font-semibold text-gray-800">{role.title}</p>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{role.description}</p>
        </button>
    );
};

// ==== PAGE ====
export default function Page() {
    const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) router.replace("/dashboard");
        });
        return unsubscribe;
    }, [router]);

    const handleContinue = () => {
        if (selectedRole) router.push(selectedRole.route);
    };

    const handleLogin = () => router.push("/login");

    return (
        <div className="min-h-screen max-w-3xl mx-auto   px-4 py-8">
            <Link href="/" className="inline-flex items-center text-pink-700 gap-1 mb-4 hover:text-pink-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
            </Link>
            <div className="flex flex-col items-center justify-center h-full" >
                <div className="flex flex-col items-center">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3">
                            Choose Your Role
                        </h1>
                    </div>

                    {/* Role Cards */}
                    <div className="flex flex-col md:flex-row gap-8">
                        {ROLES.map((role) => (
                            <RoleCard
                                key={role.id}
                                role={role}
                                isSelected={selectedRole?.id === role.id}
                                onSelect={setSelectedRole}
                            />
                        ))}
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        disabled={!selectedRole}
                        className={`px-8 py-3.5 mt-8 rounded-xl font-semibold 
                       flex items-center gap-2 transition-all duration-300 shadow-sm
                       ${selectedRole
                                ? "bg-linear-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white hover:shadow-md active:scale-[0.99]"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Continue <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Login Link */}
                    <p className="mt-6 text-sm text-gray-600">
                        Already have an account?{" "}
                        <button
                            onClick={handleLogin}
                            className="text-pink-500 hover:text-pink-600 font-semibold transition-colors"
                        >
                            Log in
                        </button>
                    </p>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 mt-8">
                        By continuing, you agree to our Terms & Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
