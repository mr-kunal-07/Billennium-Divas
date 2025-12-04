import mongoose from "mongoose";

interface IPastInvestment {
    companyName: string;
    investedAmount: number;
    year?: number; // Optional if you want to add year
}

interface IInvestor {
    _id?: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    number?: string;
    type: "Angel" | "VC" | "Other";
    role: "investor";
    hasInvestedBefore: boolean;
    pastInvestments?: IPastInvestment[];
    investmentSector?: string;
    fundSize?: number;
    accountStatus?: String;
}

const investmentSchema = new mongoose.Schema<IPastInvestment>({
    companyName: { type: String, required: true },
    investedAmount: { type: Number, required: true },
    year: { type: Number }, // Optional field
});

const investorSchema = new mongoose.Schema<IInvestor>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        number: { type: String },
        password: { type: String, required: true, select: false },
        type: {
            type: String,
            required: true,
            enum: ["Angel", "VC", "Other"],
        },
        role: {
            type: String,
            default: "investor",
            enum: ["investor"],
        },
        hasInvestedBefore: {
            type: Boolean,
            required: true,
        },
        pastInvestments: {
            type: [investmentSchema],
            default: [],
        },
        investmentSector: {
            type: String,
            trim: true,
        },
        fundSize: {
            type: Number,
            min: 0,
        },
        accountStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

    },
    { timestamps: true }
);

const Investor =
    mongoose.models?.Investors ||
    mongoose.model<IInvestor>("Investors", investorSchema);


export default Investor;
