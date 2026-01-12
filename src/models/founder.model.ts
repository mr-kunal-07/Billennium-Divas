import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

/* ---------------- Types ---------------- */

export interface IFounder extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    linkedin?: string;

    age: number;
    gender: "male" | "female" | "other" | "prefer_not_to_say";

    password: string;

    companyName: string;
    companyWebsite?: string;
    companyLinkedin?: string;

    isIncorporated: boolean;
    incorporationDate?: Date;
    incorporationCountry?: string;

    companyStage: "Idea" | "MVP" | "Early Revenue" | "Growth" | "Scale";
    roundSize?: number;

    keywords: string[];

    meetingLink?: string;
    pitchDeck?: string;
    pitchVideo?: string;

    accountStatus: "pending" | "approved";

    createdAt: Date;
    updatedAt: Date;
}

/* ---------------- Schema ---------------- */

const FounderSchema = new Schema<IFounder>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        phone: {
            type: String,
            trim: true,
        },
        linkedin: {
            type: String,
            trim: true,
        },

        /* 🔥 NEW */
        age: {
            type: Number,
            required: true,
            min: 18,
            max: 100,
        },
        gender: {
            type: String,
            required: true,
            enum: ["male", "female", "other", "prefer_not_to_say"],
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false, // 🔐 hide by default
        },

        companyName: {
            type: String,
            required: true,
            trim: true,
        },
        companyWebsite: {
            type: String,
            trim: true,
        },
        companyLinkedin: {
            type: String,
            trim: true,
        },

        isIncorporated: {
            type: Boolean,
            default: false,
        },
        incorporationDate: {
            type: Date,
        },
        incorporationCountry: {
            type: String,
            trim: true,
        },

        companyStage: {
            type: String,
            required: true,
            enum: ["Idea", "MVP", "Early Revenue", "Growth", "Scale"],
        },

        roundSize: {
            type: Number,
            min: 0,
            max: 1_000_000_000,
        },

        keywords: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length >= 3 && v.length <= 6,
                message: "Keywords must contain 3 to 6 items",
            },
        },

        meetingLink: String,
        pitchDeck: String,
        pitchVideo: String,

        accountStatus: {
            type: String,
            enum: ["pending", "approved"],
            default: "pending",
        },
    },
    { timestamps: true }
);

/* ---------------- Indexes ---------------- */

FounderSchema.index({ email: 1 });
FounderSchema.index({ keywords: 1 });

/* ---------------- Security ---------------- */

// Hash password before save
FounderSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

/* ---------------- Model ---------------- */

const Founder =
    mongoose.models.Founder ||
    mongoose.model<IFounder>("Founder", FounderSchema);

export default Founder;
