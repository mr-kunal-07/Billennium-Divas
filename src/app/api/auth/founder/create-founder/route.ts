import connectDB from "@/lib/db";
import Founder from "@/models/founder.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const {
            firstName,
            lastName,
            email,
            phone,
            linkedin,
            password,
            companyName,
            companyWebsite,
            companyLinkedin,
            isIncorporated,
            incorporationDate,
            incorporationCountry,
            companyStage,
            roundSize,
            keywords,
            meetingLink,
            pitchDeck,
            pitchVideo,
        } = await req.json();

        // Check if founder already exists
        const existingFounder = await Founder.findOne({ email });
        if (existingFounder) {
            return NextResponse.json(
                { message: "Email already registered" },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!firstName || !lastName || !email || !companyName || !companyStage) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate password length
        if (!password || password.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Invalid email format" },
                { status: 400 }
            );
        }

        // Validate company stage
        const validStages = ["Idea", "MVP", "Early Revenue", "Growth", "Scale"];
        if (!validStages.includes(companyStage)) {
            return NextResponse.json(
                { message: "Invalid company stage" },
                { status: 400 }
            );
        }

        // Validate keywords
        if (!keywords || !Array.isArray(keywords) || keywords.length < 3 || keywords.length > 6) {
            return NextResponse.json(
                { message: "Keywords must be an array with 3-6 items" },
                { status: 400 }
            );
        }

        // Validate incorporation data if company is incorporated
        if (isIncorporated && !incorporationCountry) {
            return NextResponse.json(
                { message: "Country of incorporation is required for incorporated companies" },
                { status: 400 }
            );
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create founder
        const founder = await Founder.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            phone: phone?.trim() || undefined,
            linkedin: linkedin?.trim() || undefined,
            password: hashedPassword,
            companyName: companyName.trim(),
            companyWebsite: companyWebsite?.trim() || undefined,
            companyLinkedin: companyLinkedin?.trim() || undefined,
            isIncorporated,
            incorporationDate: isIncorporated && incorporationDate ? incorporationDate : undefined,
            incorporationCountry: isIncorporated ? incorporationCountry : undefined,
            companyStage,
            roundSize: roundSize || undefined,
            keywords,
            meetingLink: meetingLink?.trim() || undefined,
            pitchDeck: pitchDeck?.trim() || undefined,
            pitchVideo: pitchVideo?.trim() || undefined,
        });

        // Return response without password
        const founderResponse = {
            id: founder._id,
            firstName: founder.firstName,
            lastName: founder.lastName,
            email: founder.email,
            companyName: founder.companyName,
            companyStage: founder.companyStage,
        };

        return NextResponse.json(
            {
                founder: founderResponse,
                message: "Founder account created successfully"
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Founder registration error:", error);
        return NextResponse.json(
            { message: "Registration failed. Please try again." },
            { status: 500 }
        );
    }
}