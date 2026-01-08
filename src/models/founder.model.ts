import mongoose, { Schema, Document } from "mongoose";

export interface IFounder extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    linkedin?: string;
    password: string;
    companyName: string;
    companyWebsite?: string;
    companyLinkedin?: string;
    isIncorporated: boolean;
    incorporationDate?: string;
    incorporationCountry?: string;
    companyStage: "Idea" | "MVP" | "Early Revenue" | "Growth" | "Scale";
    roundSize?: number;
    keywords: string[];
    meetingLink?: string;
    pitchDeck?: string;
    pitchVideo?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FounderSchema: Schema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            minlength: [2, "First name must be at least 2 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            minlength: [2, "Last name must be at least 2 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
        },
        phone: {
            type: String,
            trim: true,
        },
        linkedin: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
        },
        companyName: {
            type: String,
            required: [true, "Company name is required"],
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
            required: true,
            default: false,
        },
        incorporationDate: {
            type: String,
        },
        incorporationCountry: {
            type: String,
            trim: true,
        },
        companyStage: {
            type: String,
            required: [true, "Company stage is required"],
            enum: ["Idea", "MVP", "Early Revenue", "Growth", "Scale"],
        },
        roundSize: {
            type: Number,
            min: [0, "Round size cannot be negative"],
        },
        keywords: {
            type: [String],
            required: [true, "Keywords are required"],
            validate: {
                validator: function (v: string[]) {
                    return v && v.length >= 3 && v.length <= 6;
                },
                message: "Keywords must contain between 3 and 6 items",
            },
        },
        meetingLink: {
            type: String,
            trim: true,
        },
        pitchDeck: {
            type: String,
            trim: true,
        },
        pitchVideo: {
            type: String,
            trim: true,
        },
        accountStatus: {
            type: String,
            enum: ["pending", "approved"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

// Create index on email for faster lookups
FounderSchema.index({ email: 1 });

// Create index on keywords for search functionality
FounderSchema.index({ keywords: 1 });

const Founder = mongoose.models.Founder || mongoose.model<IFounder>("Founder", FounderSchema);

export default Founder;