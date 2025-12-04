import connectDB from "@/lib/db";
import Investor from "@/models/investor.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const {
            name,
            email,
            password,
            number,
            type,
            hasInvestedBefore,
            pastInvestments,
            investmentSector,
            fundSize,
        } = await req.json();

        // Check if investor already exists
        const existInvestor = await Investor.findOne({ email });
        if (existInvestor) {
            return NextResponse.json(
                { message: "Investor already exist" },
                { status: 400 }
            );
        }

        // Validate password length
        if (!password || password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Validate investor type
        const validTypes = ["Angel", "VC", "Other"];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { message: "Invalid investor type" },
                { status: 400 }
            );
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 12);

        const investor = await Investor.create({
            name,
            email,
            password: hashedPassword,
            number,
            type,
            hasInvestedBefore,
            pastInvestments: hasInvestedBefore ? pastInvestments : [],
            investmentSector,
            fundSize,
        });

        return NextResponse.json(
            { investor, message: "Investor created successfully" },
            { status: 201 }
        );

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: `register error ${error}` },
            { status: 500 }
        );
    }
}
