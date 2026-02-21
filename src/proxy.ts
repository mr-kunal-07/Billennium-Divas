import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/investor-signup",
        "/founder-signup",
    ];

    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    const token = req.cookies.get("token")?.value;
    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    ],
};
