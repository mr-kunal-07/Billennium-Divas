import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDB from "./lib/db"
import bcrypt from "bcryptjs"
import Investor from "./models/investor.model"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await connectDB()

                const email = credentials?.email
                const password = credentials?.password as string

                const user = await Investor.findOne({ email }).select("+password")

                if (!user) throw new Error("User not found")

                const isPasswordCorrect = await bcrypt.compare(password, user.password)
                if (!isPasswordCorrect) throw new Error("Incorrect password")

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: ""
                }
            },
        })
    ],

    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id,
                    token.name = user.name,
                    token.email = user.email,
                    token.role = user.role
            }
            return token
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string,
                    session.user.name = token.name as string,
                    session.user.email = token.email as string,
                    session.user.role = token.role as string
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