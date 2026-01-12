import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

/* ---------------- Types ---------------- */

export interface IFounder extends Document {
    firstName: string;
    lastName: string;
    gender: "male" | "female" | "other";

    email: string;
    phone?: string;
    birthYear: number;

    linkedin?: string;

    emailVerified: boolean;
    role: "founder"
    password: string;

    companyName: string;
    companyWebsite?: string;
    companyLinkedin?: string;
    companyInstagram?: string;

    isIncorporated: boolean;
    incorporationDate?: Date;
    incorporationCountry?: string;

    companyStage: "Idea" | "MVP" | "Early Revenue" | "Growth" | "Scale";
    roundSize?: number;

    keywords: string[];

    pitchDeck?: string;
    pitchVideo?: string;

    accountStatus: "pending" | "approved";

    createdAt: Date;
    updatedAt: Date;

    comparePassword(candidatePassword: string): Promise<boolean>;
}

/* ---------------- Schema ---------------- */

const FounderSchema = new Schema<IFounder>(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            minlength: [2, "First name must be at least 2 characters"],
            maxlength: [50, "First name must not exceed 50 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            minlength: [2, "Last name must be at least 2 characters"],
            maxlength: [50, "Last name must not exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
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

        birthYear: {
            type: Number,
            required: [true, "Birth year is required"],
            min: [1924, "Birth year must be 1924 or later"],
            max: [new Date().getFullYear() - 18, "You must be at least 18 years old"],
        },

        gender: {
            type: String,
            required: [true, "Gender is required"],
            enum: {
                values: ["male", "female", "other", "prefer_not_to_say"],
                message: "Invalid gender value"
            },
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false, // 🔐 hidden by default
        },

        companyName: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
            minlength: [2, "Company name must be at least 2 characters"],
        },
        companyWebsite: {
            type: String,
            trim: true,
        },
        companyLinkedin: {
            type: String,
            trim: true,
        },
        companyInstagram: {
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
            required: [true, "Company stage is required"],
            enum: {
                values: ["Idea", "MVP", "Early Revenue", "Growth", "Scale"],
                message: "Invalid company stage"
            },
        },

        roundSize: {
            type: Number,
            min: [0, "Round size cannot be negative"],
            max: [1_000_000_000, "Round size cannot exceed 1 billion"],
        },

        keywords: {
            type: [String],
            required: [true, "Keywords are required"],
            validate: {
                validator: (v: string[]) => v.length >= 3 && v.length <= 6,
                message: "Keywords must contain 3 to 6 items",
            },
        },
        pitchDeck: {
            type: String,
            trim: true,
            required: [true, "Pitch deck is required"],
        },
        pitchVideo: {
            type: String,
            trim: true,
            required: [true, "Pitch video is required"],
        },

        accountStatus: {
            type: String,
            enum: ["pending", "approved"],
            default: "pending",
        },
    },
    { timestamps: true }
);

/* ---------------- Indexes ---------------- */

FounderSchema.index({ email: 1 }, { unique: true });
FounderSchema.index({ keywords: 1 });
FounderSchema.index({ companyStage: 1 });
FounderSchema.index({ accountStatus: 1 });
FounderSchema.index({ createdAt: -1 });

/* ---------------- Pre-save Hook for Password Hashing ---------------- */

FounderSchema.pre("save", async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/* ---------------- Instance Methods ---------------- */

FounderSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    if (!this.password) {
        throw new Error("Password not loaded. Use .select('+password')");
    }
    return bcrypt.compare(candidatePassword, this.password);
};

/* ---------------- Model ---------------- */

const Founder =
    mongoose.models.Founder ||
    mongoose.model<IFounder>("Founder", FounderSchema);

export default Founder;