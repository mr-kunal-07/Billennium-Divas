"use client"

import { JSX } from "react"
import { useSession } from "next-auth/react"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import FounderDashboard from "@/components/Founder/dashboard/FounderDashbord"
import FPending from "@/components/Founder/dashboard/FPending"
import InvestorDashboard from "@/components/Investor/dashboard/InvestorDashbord"
import IPending from "@/components/Investor/dashboard/IPending"

export default function Dashboard() {
    const router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.replace("/login")
        },
    })

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
                <Loader2 className="w-12 h-12 animate-spin text-pink-500 mb-4" />
                <p className="text-gray-600 font-medium">Loading your dashboard...</p>
            </div>
        )
    }

    if (!session?.user) return null

    const { role, accountStatus = "pending" } = session.user
    const dashboardKey = `${role}-${accountStatus}`

    const dashboards: Record<string, JSX.Element> = {
        "founder-pending": <FPending />,
        "founder-approved": <FounderDashboard />,
        "investor-pending": <IPending />,
        "investor-approved": <InvestorDashboard />,
    }

    return dashboards[dashboardKey] || (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <p className="text-gray-800 font-semibold text-lg mb-2">Invalid Account Configuration</p>
            <p className="text-gray-600 mb-4">
                Role: {role} | Status: {accountStatus}
            </p>
        </div>
    )
}