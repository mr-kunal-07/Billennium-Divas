import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDB from "./lib/db"
import bcrypt from "bcryptjs"
import Investor from "./models/investor.model"
import Founder from "./models/founder.model"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                userType: { label: "User Type", type: "text" } // Optional: to specify login type
            },
            async authorize(credentials) {

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required")
                }

                try {
                    await connectDB()
                } catch (error) {
                    throw new Error("Database connection failed")
                }

                const email = credentials?.email
                const password = credentials?.password as string
                const userType = credentials?.userType as string | undefined

                let user = null
                let accountType = ""

                // If userType is specified, search only that collection
                if (userType === "investor") {
                    user = await Investor.findOne({ email }).select("+password")
                    accountType = "investor"
                } else if (userType === "founder") {
                    user = await Founder.findOne({ email }).select("+password")
                    accountType = "founder"
                } else {
                    // Try to find user in both collections
                    user = await Investor.findOne({ email }).select("+password")
                    if (user) {
                        accountType = "investor"
                    } else {
                        user = await Founder.findOne({ email }).select("+password")
                        if (user) {
                            accountType = "founder"
                        }
                    }
                }

                if (!user) throw new Error("User not found")

                const isPasswordCorrect = await bcrypt.compare(password, user.password)
                if (!isPasswordCorrect) throw new Error("Incorrect password")

                // Return user data based on account type
                if (accountType === "investor") {
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role || "investor",
                        accountType: "investor",
                        accountStatus: user.accountStatus || "pending", // ✅ Add this
                        image: user.image || ""
                    }
                } else {
                    // Founder
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: `${user.firstName} ${user.lastName}`,
                        role: user.role || "founder",
                        accountType: "founder",
                        accountStatus: user.accountStatus || "pending", // ✅ Add this
                        companyName: user.companyName,
                        image: user.image || ""
                    }
                }
            },
        })
    ],

    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.name = user.name
                token.email = user.email
                token.role = user.role
                token.accountType = user.accountType
                token.accountStatus = user.accountStatus // ✅ Add this
                if (user.accountType === "founder") {
                    token.companyName = user.companyName
                }
            }
            return token
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.name = token.name as string
                session.user.email = token.email as string
                session.user.role = token.role as "founder" | "investor"
                session.user.accountType = token.accountType as "investor" | "founder"
                session.user.accountStatus = token.accountStatus as "pending" | "approved" // ✅ Add this
                if (token.accountType === "founder") {
                    session.user.companyName = token.companyName as string
                }
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    session: {
        strategy: "jwt",
        maxAge: 10 * 24 * 60 * 60 // 10 days
    },
    secret: process.env.AUTH_SECRET
})