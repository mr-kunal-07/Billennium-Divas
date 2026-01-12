import connectDB from "@/lib/db";
import Founder from "@/models/founder.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        // Log received data for debugging
        console.log("Received registration data:", {
            ...body,
            password: "[REDACTED]"
        });

        const {
            firstName,
            lastName,
            gender,
            email,
            phone,
            birthYear,
            linkedin,
            password,
            companyName,
            companyWebsite,
            companyLinkedin,
            companyInstagram,
            isIncorporated,
            incorporationDate,
            incorporationCountry,
            roundSize,
            companyStage,
            keywords,
            pitchDeck,
            pitchVideo,
        } = body;

        // Validate required fields with specific error messages
        const requiredFields = {
            firstName,
            lastName,
            email,
            gender,
            birthYear,
            companyName,
            companyStage,
            password,
            pitchDeck,
            pitchVideo,
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key, _]) => key);

        if (missingFields.length > 0) {
            console.error("Missing required fields:", missingFields);
            return NextResponse.json(
                {
                    message: `Missing required fields: ${missingFields.join(", ")}`,
                    missingFields
                },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 8) {
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

        // Validate birthYear - check if it's a valid number
        const currentYear = new Date().getFullYear();
        if (typeof birthYear !== 'number' || birthYear < 1924 || birthYear > currentYear - 18) {
            return NextResponse.json(
                { message: `Invalid birth year. Must be between 1924 and ${currentYear - 18}` },
                { status: 400 }
            );
        }

        // Validate gender
        const validGenders = ["male", "female", "other", "prefer_not_to_say"];
        if (!validGenders.includes(gender)) {
            return NextResponse.json(
                { message: "Invalid gender" },
                { status: 400 }
            );
        }

        // Check for existing email
        const normalizedEmail = email.toLowerCase().trim();
        const existingFounder = await Founder.findOne({
            email: normalizedEmail,
        });

        if (existingFounder) {
            return NextResponse.json(
                { message: "Email already registered" },
                { status: 400 }
            );
        }

        // Parse incorporation date properly
        let parsedIncorporationDate;
        if (isIncorporated && incorporationDate) {
            // incorporationDate comes as "YYYY-MM" string from frontend
            const [year, month] = incorporationDate.split('-');
            if (year && month) {
                // Create date object (month is 0-indexed in JS)
                parsedIncorporationDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            }
        }

        // Create founder document
        const founder = await Founder.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            phone: phone?.trim() || undefined,
            linkedin: linkedin?.trim() || undefined,
            gender,
            age: currentYear - birthYear,
            birthYear,
            password, // Make sure to hash this in the schema pre-save hook!
            companyName: companyName.trim(),
            companyWebsite: companyWebsite?.trim() || undefined,
            companyLinkedin: companyLinkedin?.trim() || undefined,
            companyInstagram: companyInstagram?.trim() || undefined,
            isIncorporated: isIncorporated === true || isIncorporated === "true",
            incorporationDate: parsedIncorporationDate,
            incorporationCountry: isIncorporated ? incorporationCountry?.trim() : undefined,
            companyStage,
            roundSize: roundSize ? Number(roundSize) : undefined,
            keywords: keywords.map((k: string) => k.trim().toLowerCase()),
            pitchDeck: pitchDeck?.trim() || undefined,
            pitchVideo: pitchVideo?.trim() || undefined,
            role: 'founder',
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

    } catch (error: any) {
        console.error("Founder registration error:", error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                { message: `Validation error!: ${messages.join(', ')}` },
                { status: 400 }
            );
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return NextResponse.json(
                { message: "Email already registered" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Registration failed. Please try again." },
            { status: 500 }
        );
    }
}