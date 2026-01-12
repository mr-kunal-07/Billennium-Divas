import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
    const csrfToken = crypto.randomBytes(32).toString("hex");

    const response = NextResponse.json({ csrfToken });

    response.cookies.set("csrfToken", csrfToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });

    return response;
}
