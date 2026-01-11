import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Public routes
    const publicRoutes = [
        "/login",
        "/register",
        "/investor-signup",
        "/founder-signup",
    ]

    // Allow landing page ONLY
    if (pathname === "/") {
        return NextResponse.next()
    }

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // Everything else is protected
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    })

    if (!token) {
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", req.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    ],
}
