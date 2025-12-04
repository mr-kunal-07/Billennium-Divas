"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, ShieldAlert } from "lucide-react"

export default function Dashboard() {
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status !== "loading") {
            setLoading(false)
        }
    }, [status])

    // Show loading spinner
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            </div>
        )
    }

    // If no session - redirect or show unauthorized
    if (!session?.user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-600 text-lg">Unauthorized. Please log in.</p>
            </div>
        )
    }

    // Assuming accountStatus comes from MongoDB later
    const accountStatus = "pending"

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto">

                {/* Greeting */}
                <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                    Welcome, {session.user.name}
                </h1>

                {/* Pending Approval Message */}
                {accountStatus === "pending" && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 shadow-sm flex items-start gap-4">
                        <ShieldAlert className="w-8 h-8 text-yellow-600" />

                        <div>
                            <h2 className="text-xl font-medium text-yellow-700">
                                Account Verification Pending
                            </h2>
                            <p className="text-yellow-700 mt-1">
                                Your account is currently under review. Once approved,
                                you will gain full access to the investor dashboard.
                            </p>
                        </div>
                    </div>
                )}

                {/* Hide dashboard content until approved */}
                {accountStatus !== "pending" && (
                    <div className="mt-6">
                        {/* Your real dashboard content goes here */}
                        <p>Your dashboard content...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
