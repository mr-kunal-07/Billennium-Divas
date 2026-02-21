"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

type InvestorType = "Angel" | "VC" | "Other";

type PastInvestment = {
  companyName: string;
  investedAmount: number | "";
  year: number | "";
};

type FormData = {
  name: string;
  email: string;
  password: string;
  number: string;
  type: InvestorType;
  investmentSector: string;
  fundSize: number | "";
};

// ─── Constants ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENT_YEAR = new Date().getFullYear();

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "Email already registered",
  "auth/weak-password": "Password is too weak",
  "auth/invalid-email": "Invalid email address",
};

const INITIAL_FORM: FormData = {
  name: "", email: "", password: "", number: "",
  type: "Angel", investmentSector: "", fundSize: "",
};

const INITIAL_INVESTMENT: PastInvestment = { companyName: "", investedAmount: "", year: "" };

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all";
const sectionTitle = "text-lg font-semibold text-gray-900 border-b pb-2";

const FieldLabel = ({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-2">
    {label} {required && <span className="text-red-500">*</span>}
  </label>
);

const StatusMessage = ({ type, text }: { type: "error" | "success"; text: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-4 rounded-lg mb-6 flex items-center gap-2 border ${
      type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"
    }`}
  >
    {type === "error" ? <X className="w-5 h-5 flex-shrink-0" /> : <Check className="w-5 h-5 flex-shrink-0" />}
    <span className="font-medium">{text}</span>
  </motion.div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvestorRegisterForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [hasInvestedBefore, setHasInvestedBefore] = useState(false);
  const [pastInvestments, setPastInvestments] = useState<PastInvestment[]>([INITIAL_INVESTMENT]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // ─── Form Helpers ───────────────────────────────────────────────────────────

  const updateField = (field: keyof FormData, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const updateInvestment = (idx: number, patch: Partial<PastInvestment>) =>
    setPastInvestments((prev) => prev.map((inv, i) => (i === idx ? { ...inv, ...patch } : inv)));

  const addInvestment = () =>
    setPastInvestments((prev) => [...prev, { ...INITIAL_INVESTMENT }]);

  const removeInvestment = (idx: number) =>
    setPastInvestments((prev) => prev.filter((_, i) => i !== idx));

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validate = (): string | null => {
    const { name, email, password, type } = formData;
    if (!name.trim() || !email.trim() || !password) return "Name, email and password are required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!EMAIL_REGEX.test(email)) return "Invalid email address.";
    if (!["Angel", "VC", "Other"].includes(type)) return "Invalid investor type.";
    if (hasInvestedBefore) {
      for (const pi of pastInvestments) {
        if (!pi.companyName.trim() || !pi.investedAmount) {
          return "Please fill company name and amount for all past investments.";
        }
      }
    }
    return null;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const error = validate();
    if (error) return setMessage({ type: "error", text: error });

    setLoading(true);
    let firebaseUser: any = null;

    try {
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.toLowerCase().trim(),
        formData.password
      ).catch((err: any) => {
        throw new Error(FIREBASE_ERRORS[err.code] ?? "Failed to create account");
      });

      firebaseUser = userCredential.user;

      // Step 2: Set display name
      await updateProfile(firebaseUser, { displayName: formData.name.trim() });

      // Step 3: Build Firestore document
      const investorDoc = {
        uid: firebaseUser.uid,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        number: formData.number.trim() || null,
        type: formData.type,
        investmentSector: formData.investmentSector.trim() || null,
        fundSize: formData.fundSize === "" ? null : Number(formData.fundSize),
        hasInvestedBefore,
        pastInvestments: hasInvestedBefore
          ? pastInvestments.map((pi) => ({
              companyName: pi.companyName.trim(),
              investedAmount: Number(pi.investedAmount),
              year: pi.year === "" ? null : Number(pi.year),
            }))
          : [],
        role: "investor",
        createdAt: serverTimestamp(),
      };

      // Step 4: Save to Firestore /investors/{uid}
      await setDoc(doc(db, "investors", firebaseUser.uid), investorDoc);

      setMessage({ type: "success", text: "Investor account created successfully!" });

      // Reset form
      setFormData(INITIAL_FORM);
      setHasInvestedBefore(false);
      setPastInvestments([{ ...INITIAL_INVESTMENT }]);

      setTimeout(() => { window.location.href = "/login"; }, 2000);
    } catch (err: any) {
      // Rollback: delete Auth user if Firestore write failed
      if (firebaseUser) {
        try { await firebaseUser.delete(); } catch {}
      }
      setMessage({ type: "error", text: err.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-3xl mx-auto">
        <Link href="/register" className="inline-flex items-center text-pink-700 gap-1 mb-4 hover:text-pink-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Investor Account</h2>
            <p className="text-gray-600">Join our network of investors and discover opportunities</p>
          </div>

          {message && <StatusMessage type={message.type} text={message.text} />}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">

            {/* ── Basic Information ── */}
            <div className="space-y-4">
              <h3 className={sectionTitle}>Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="name" label="Full Name" required />
                  <input
                    id="name" type="text" value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={inputClass} placeholder="Enter your name"
                    required disabled={loading}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="email" label="Email" required />
                  <input
                    id="email" type="email" value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClass} placeholder="Enter your email"
                    required disabled={loading} autoComplete="email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="password" label="Password" required />
                  <input
                    id="password" type="password" value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={inputClass} placeholder="Min 8 characters"
                    required disabled={loading} minLength={8} autoComplete="new-password"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="phone" label="Phone Number" />
                  <input
                    id="phone" type="tel" value={formData.number}
                    onChange={(e) => updateField("number", e.target.value)}
                    className={inputClass} placeholder="Enter your number"
                    disabled={loading} autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            {/* ── Investor Details ── */}
            <div className="space-y-4">
              <h3 className={sectionTitle}>Investor Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="type" label="Investor Type" />
                  <select
                    id="type" value={formData.type}
                    onChange={(e) => updateField("type", e.target.value as InvestorType)}
                    className={`${inputClass} bg-white`} disabled={loading}
                  >
                    <option value="Angel">Angel Investor</option>
                    <option value="VC">Venture Capital</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="sector" label="Investment Sector" />
                  <input
                    id="sector" type="text" value={formData.investmentSector}
                    onChange={(e) => updateField("investmentSector", e.target.value)}
                    className={inputClass} placeholder="e.g., FinTech, Healthcare"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="fundSize" label="Fund Size ($)" />
                <input
                  id="fundSize" type="number" min="0"
                  value={formData.fundSize === "" ? "" : String(formData.fundSize)}
                  onChange={(e) => updateField("fundSize", e.target.value === "" ? "" : Number(e.target.value))}
                  className={inputClass} placeholder="1000000" disabled={loading}
                />
              </div>
            </div>

            {/* ── Past Investments ── */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={hasInvestedBefore}
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
                      type="button" onClick={addInvestment} disabled={loading}
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
                            type="button" onClick={() => removeInvestment(idx)} disabled={loading}
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
                        type="text" placeholder="Company name" value={pi.companyName}
                        onChange={(e) => updateInvestment(idx, { companyName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        disabled={loading}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number" placeholder="Amount ($)" min="0"
                          value={pi.investedAmount === "" ? "" : String(pi.investedAmount)}
                          onChange={(e) => updateInvestment(idx, { investedAmount: e.target.value === "" ? "" : Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          disabled={loading}
                        />
                        <input
                          type="number" placeholder="Year"
                          min="1900" max={CURRENT_YEAR}
                          value={pi.year === "" ? "" : String(pi.year)}
                          onChange={(e) => updateInvestment(idx, { year: e.target.value === "" ? "" : Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* ── Submit ── */}
            <div className="pt-4">
              <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </span>
                ) : "Create Account"}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}