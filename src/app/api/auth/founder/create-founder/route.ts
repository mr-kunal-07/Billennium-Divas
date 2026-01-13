import connectDB from "@/lib/db";
import Founder from "@/models/founder.model";
import { NextRequest, NextResponse } from "next/server";

// Validation constants
const VALID_STAGES = ["Idea", "MVP", "Early Revenue", "Growth", "Scale"];
const VALID_GENDERS = ["male", "female", "other"];
const MIN_BIRTH_YEAR = 1924;
const MIN_AGE = 18;
const MIN_KEYWORDS = 3;
const MAX_KEYWORDS = 6;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

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
            onePager,
            pitchVideo,
        } = body;

        // Validate required fields
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
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing required fields: ${missingFields.join(", ")}` },
                { status: 400 }
            );
        }

        // Validate password
        if (password.length < MIN_PASSWORD_LENGTH) {
            return NextResponse.json(
                { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
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
        if (!VALID_STAGES.includes(companyStage)) {
            return NextResponse.json(
                { message: "Invalid company stage" },
                { status: 400 }
            );
        }

        // Validate keywords
        if (!Array.isArray(keywords) || keywords.length < MIN_KEYWORDS || keywords.length > MAX_KEYWORDS) {
            return NextResponse.json(
                { message: `Keywords must be an array with ${MIN_KEYWORDS}-${MAX_KEYWORDS} items` },
                { status: 400 }
            );
        }

        // Validate incorporation requirements
        if (isIncorporated && !incorporationCountry) {
            return NextResponse.json(
                { message: "Country of incorporation is required for incorporated companies" },
                { status: 400 }
            );
        }

        // Validate birth year
        const currentYear = new Date().getFullYear();
        if (typeof birthYear !== 'number' || birthYear < MIN_BIRTH_YEAR || birthYear > currentYear - MIN_AGE) {
            return NextResponse.json(
                { message: `Invalid birth year. Must be between ${MIN_BIRTH_YEAR} and ${currentYear - MIN_AGE}` },
                { status: 400 }
            );
        }

        // Validate gender
        if (!VALID_GENDERS.includes(gender)) {
            return NextResponse.json(
                { message: "Invalid gender" },
                { status: 400 }
            );
        }

        // Check for existing email
        const normalizedEmail = email.toLowerCase().trim();
        const existingFounder = await Founder.findOne({ email: normalizedEmail });

        if (existingFounder) {
            return NextResponse.json(
                { message: "Email already registered" },
                { status: 400 }
            );
        }

        // Parse incorporation date
        let parsedIncorporationDate;
        if (isIncorporated && incorporationDate) {
            const [year, month] = incorporationDate.split('-');
            if (year && month) {
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
            password,
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
            onePager: onePager?.trim() || undefined,
            pitchVideo: pitchVideo?.trim() || undefined,
            role: 'founder',
        });

        return NextResponse.json(
            {
                founder: {
                    id: founder._id,
                    firstName: founder.firstName,
                    lastName: founder.lastName,
                    email: founder.email,
                    companyName: founder.companyName,
                    companyStage: founder.companyStage,
                    role: founder.role,
                },
                message: "Founder account created successfully",
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Founder registration error:", error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                { message: `Validation error: ${messages.join(', ')}` },
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