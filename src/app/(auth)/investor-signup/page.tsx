"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type PastInvestment = {
    companyName: string;
    investedAmount: number | "";
    year?: number | "";
};

type InvestorType = "Angel" | "VC" | "Other";

export default function InvestorRegisterForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        number: "",
        type: "Angel" as InvestorType,
        investmentSector: "",
        fundSize: "" as number | "",
    });
    const [hasInvestedBefore, setHasInvestedBefore] = useState(false);
    const [pastInvestments, setPastInvestments] = useState<PastInvestment[]>([
        { companyName: "", investedAmount: "", year: "" },
    ]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateInvestment = (idx: number, payload: Partial<PastInvestment>) => {
        setPastInvestments(prev => prev.map((inv, i) => i === idx ? { ...inv, ...payload } : inv));
    };

    const addInvestment = () => {
        setPastInvestments(prev => [...prev, { companyName: "", investedAmount: "", year: "" }]);
    };

    const removeInvestment = (idx: number) => {
        setPastInvestments(prev => prev.filter((_, i) => i !== idx));
    };

    const validateForm = () => {
        const { name, email, password, type } = formData;

        if (!name.trim() || !email.trim() || !password) {
            setMessage({ type: "error", text: "Name, email and password are required." });
            return false;
        }
        if (password.length < 8) {
            setMessage({ type: "error", text: "Password must be at least 8 characters." });
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setMessage({ type: "error", text: "Invalid email address." });
            return false;
        }
        if (!["Angel", "VC", "Other"].includes(type)) {
            setMessage({ type: "error", text: "Invalid investor type." });
            return false;
        }
        if (hasInvestedBefore) {
            for (const pi of pastInvestments) {
                if (!pi.companyName || !pi.investedAmount) {
                    setMessage({ type: "error", text: "Please fill all past investments fields (company name and amount)." });
                    return false;
                }
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!validateForm()) return;

        setLoading(true);
        try {
            const body = {
                ...formData,
                hasInvestedBefore,
                pastInvestments: hasInvestedBefore ? pastInvestments.map(pi => ({
                    companyName: String(pi.companyName).trim(),
                    investedAmount: Number(pi.investedAmount),
                    year: pi.year ? Number(pi.year) : undefined
                })) : [],
                investmentSector: formData.investmentSector || undefined,
                fundSize: formData.fundSize === "" ? undefined : Number(formData.fundSize),
            };

            const res = await fetch("/api/auth/invester/create-invester", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: "error", text: data?.message || "Registration failed. Please try again." });
            } else {
                setMessage({ type: "success", text: data?.message || "Investor account created successfully!" });
                // Reset form
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    number: "",
                    type: "Angel",
                    investmentSector: "",
                    fundSize: "",
                });
                setHasInvestedBefore(false);
                setPastInvestments([{ companyName: "", investedAmount: "", year: "" }]);

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }
        } catch (err) {
            console.error("Registration error:", err);
            setMessage({ type: "error", text: "Network error. Please check your connection and try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-purple-50">
            <div className="max-w-3xl mx-auto">
                <Link href="/register" className="inline-flex items-center text-pink-700 gap-1 mb-4 hover:text-pink-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Investor Account</h2>
                        <p className="text-gray-600">Join our network of investors and discover opportunities</p>
                    </div>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg mb-6 ${message.type === "error"
                                ? "bg-red-50 text-red-800 border border-red-200"
                                : "bg-green-50 text-green-800 border border-green-200"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d={message.type === "error"
                                        ? "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        : "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    } clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{message.text}</span>
                            </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => updateFormData("name", e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                        placeholder="Enter Your Name"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateFormData("email", e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                        placeholder="Enter Your Email"
                                        required
                                        disabled={loading}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => updateFormData("password", e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                        placeholder="Min 8 characters"
                                        required
                                        disabled={loading}
                                        minLength={8}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={formData.number}
                                        onChange={(e) => updateFormData("number", e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                        placeholder="Enter Your Number"
                                        disabled={loading}
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Investor Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Investor Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                        Investor Type
                                    </label>
                                    <select
                                        id="type"
                                        value={formData.type}
                                        onChange={(e) => updateFormData("type", e.target.value as InvestorType)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                                        disabled={loading}
                                    >
                                        <option value="Angel">Angel Investor</option>
                                        <option value="VC">Venture Capital</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                                        Investment Sector
                                    </label>
                                    <input
                                        id="sector"
                                        type="text"
                                        value={formData.investmentSector}
                                        onChange={(e) => updateFormData("investmentSector", e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                        placeholder="e.g., FinTech, Healthcare"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="fundSize" className="block text-sm font-medium text-gray-700 mb-2">
                                    Fund Size ($)
                                </label>
                                <input
                                    id="fundSize"
                                    type="number"
                                    value={formData.fundSize === "" ? "" : String(formData.fundSize)}
                                    onChange={(e) => updateFormData("fundSize", e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                    placeholder="1000000"
                                    disabled={loading}
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Past Investments */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hasInvestedBefore}
                                    onChange={(e) => setHasInvestedBefore(e.target.checked)}
                                    className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                    disabled={loading}
                                />
                                <span className="text-sm font-medium text-gray-700">I have invested in startups before</span>
                            </label>

                            {hasInvestedBefore && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-gray-50 rounded-lg p-4 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-gray-900">Past Investments</h4>
                                        <button
                                            type="button"
                                            onClick={addInvestment}
                                            disabled={loading}
                                            className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Investment
                                        </button>
                                    </div>

                                    {pastInvestments.map((pi, idx) => (
                                        <div key={idx} className="bg-white rounded-lg p-4 space-y-3 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Investment #{idx + 1}</span>
                                                {pastInvestments.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeInvestment(idx)}
                                                        disabled={loading}
                                                        className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                                        aria-label="Remove investment"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Company name"
                                                value={pi.companyName}
                                                onChange={(e) => updateInvestment(idx, { companyName: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                                disabled={loading}
                                            />

                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="number"
                                                    placeholder="Amount ($)"
                                                    value={pi.investedAmount === "" ? "" : String(pi.investedAmount)}
                                                    onChange={(e) => updateInvestment(idx, { investedAmount: e.target.value === "" ? "" : Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                                    disabled={loading}
                                                    min="0"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Year"
                                                    value={pi.year === "" ? "" : String(pi.year)}
                                                    onChange={(e) => updateInvestment(idx, { year: e.target.value === "" ? "" : Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                                    disabled={loading}
                                                    min="1900"
                                                    max={new Date().getFullYear()}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating Account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </div>

                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <a href="/login" className="text-pink-600 hover:text-pink-700 font-medium transition-colors">
                                Sign in
                            </a>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}