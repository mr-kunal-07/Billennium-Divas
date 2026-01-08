import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: "founder" | "investor"
            accountType: "investor" | "founder"
            accountStatus?: "pending" | "approved"
            companyName?: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: "founder" | "investor"
        accountType: "investor" | "founder"
        accountStatus?: "pending" | "approved"
        companyName?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: "founder" | "investor"
        accountType: "investor" | "founder"
        accountStatus?: "pending" | "approved"
        companyName?: string
    }
}