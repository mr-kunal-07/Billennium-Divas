"use client";

import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X } from "lucide-react";

// Types
type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    linkedin: string;
    password: string;
    confirmPassword: string;

    age: number;
    gender: "male" | "female" | "other" | "prefer_not_to_say";

    companyName: string;
    companyWebsite: string;
    companyLinkedin: string;
    isIncorporated: boolean;
    incorporationMonth: string;
    incorporationYear: string;
    incorporationCountry: string;
    companyStage: string;
    roundSize: string;
    keywords: string[];
    agreeToTerms: boolean;
    meetingLink: string;
    pitchDeck: string;
    pitchVideo: string;
};



// Constants
const COUNTRIES = [
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "CA", label: "Canada" },
    { value: "IN", label: "India" },
    { value: "SG", label: "Singapore" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "AU", label: "Australia" }
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STAGES = ["Idea", "MVP", "Early Revenue", "Growth", "Scale"];
const STEPS = ["YOUR PROFILE", "YOUR COMPANY", "FINISH"];

const GENDERS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
];


// Reusable Components
const Input = ({ label, required = false, error, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            className={`w-full px-4 py-3 border rounded-md focus:ring-1 focus:outline-none focus:border-pink-500 focus:ring-pink-500  transition-all ${error ? 'border-red-300' : 'border-gray-300'}`}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
);

const Select = ({ label, required = false, error, options, children, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:outline-none focus:border-pink-500 focus:ring-pink-500 bg-white ${error ? 'border-red-300' : 'border-gray-300'}`}
            {...props}
        >
            <option value="">Select {label.toLowerCase()}</option>
            {options?.map((opt: any) => (
                <option key={opt.value || opt} value={opt.value || opt}>
                    {opt.label || opt}
                </option>
            ))}
            {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
);

const Message = ({ type, text }: { type: "error" | "success"; text: string }) => (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg mb-6 ${type === "error" ? "bg-red-50 text-red-800 border border-red-200" : "bg-green-50 text-green-800 border border-green-200"}`}
    >
        <div className="flex items-center gap-2">
            {type === "error" ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            <span className="font-medium">{text}</span>
        </div>
    </motion.div>
);

const ProgressIndicator = ({ step }: { step: number }) => (
    <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
            {[1, 2, 3].map((s, i) => (
                <React.Fragment key={s}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= s ? 'bg-pink-500' : 'bg-gray-300'}`}>
                        {step > s ? <Check className="w-5 h-5 text-white" /> : <span className="text-white font-semibold">{s}</span>}
                    </div>
                    {i < 2 && <div className={`w-24 h-1 ${step > s ? 'bg-pink-500' : 'bg-gray-300'}`} />}
                </React.Fragment>
            ))}
        </div>
    </div>
);

export default function FounderSignupForm() {
    const [step, setStep] = useState(1);
    const [keywordInput, setKeywordInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

    const { register, handleSubmit, watch, setValue, control, formState: { errors }, trigger } = useForm<FormData>({
        defaultValues: {
            firstName: "", lastName: "", email: "", phone: "", linkedin: "",
            password: "", confirmPassword: "", companyName: "", companyWebsite: "",
            companyLinkedin: "", isIncorporated: false, incorporationMonth: "",
            incorporationYear: "", incorporationCountry: "", companyStage: "",
            roundSize: "", keywords: [], agreeToTerms: false, meetingLink: "",
            pitchDeck: "", pitchVideo: "", gender: "prefer_not_to_say", age: 0
        },
        mode: "onChange"
    });

    const password = watch("password");
    const keywords = watch("keywords");
    const isIncorporated = watch("isIncorporated");

    const showError = (text: string) => {
        setMessage({ type: "error", text });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStep1Next = async () => {
        setMessage(null);
        const isValid = await trigger(["firstName", "lastName", "email", "password", "confirmPassword", "age", "gender"]);
        if (isValid) setStep(2);
        else showError("Please fix the errors below");
    };

    const onSubmit = async (data: FormData) => {
        setMessage(null);

        // Additional validations
        if (data.keywords.length < 3) return showError("Add at least 3 keywords");
        if (!data.agreeToTerms) return showError("You must agree to Terms & Privacy Policy");

        setLoading(true);

        try {
            const payload = {
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                email: data.email.trim(),
                phone: data.phone?.trim() || undefined,
                linkedin: data.linkedin?.trim() || undefined,
                age: data.age,
                gender: data.gender,
                password: data.password,
                companyName: data.companyName.trim(),
                companyWebsite: data.companyWebsite?.trim() || undefined,
                companyLinkedin: data.companyLinkedin?.trim() || undefined,
                isIncorporated: data.isIncorporated,
                incorporationDate: data.isIncorporated && data.incorporationMonth && data.incorporationYear
                    ? `${data.incorporationYear}-${data.incorporationMonth}` : undefined,
                incorporationCountry: data.isIncorporated ? data.incorporationCountry : undefined,
                companyStage: data.companyStage,
                roundSize: data.roundSize ? Number(data.roundSize) : undefined,
                keywords: data.keywords,
                meetingLink: data.meetingLink?.trim() || undefined,
                pitchDeck: data.pitchDeck?.trim() || undefined,
                pitchVideo: data.pitchVideo?.trim() || undefined,
            };

            const res = await fetch("/api/auth/founder/create-founder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                showError(result?.message || "Registration failed. Please try again.");
            } else {
                setMessage({ type: "success", text: "Account created successfully!" });
                setStep(3);
                setTimeout(() => {
                    if (typeof window !== 'undefined') window.location.href = "/login";
                }, 2000);
            }
        } catch (err) {
            showError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const addKeyword = () => {
        const trimmed = keywordInput.trim();
        const normalized = trimmed.toLowerCase();

        if (trimmed &&
            keywords.length < 6 &&
            !keywords.some((k: string) => k.toLowerCase() === normalized)) {
            setValue("keywords", [...keywords, trimmed]);
            setKeywordInput("");
        }
    };

    const removeKeyword = (index: number) => {
        setValue("keywords", keywords.filter((_: string, i: number) => i !== index));
    };

    const passwordStrength = useMemo(() => {
        if (!password) return { strength: 0, label: "" };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
        return { strength, label: labels[strength] };
    }, [password]);

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-purple-50">
            <div className="max-w-3xl mx-auto">
                {step < 3 && (
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center text-pink-700 gap-1 mb-4 hover:text-pink-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                )}

                <ProgressIndicator step={step} />

                <div className="flex items-center justify-center gap-8 mb-8 text-xs">
                    {STEPS.map((label, i) => (
                        <span key={label} className={`font-medium ${step === i + 1 ? 'text-pink-500' : 'text-gray-500'}`}>
                            {label}
                        </span>
                    ))}
                </div>

                {message && <Message type={message.type} text={message.text} />}

                <AnimatePresence mode="wait">
                    {/* Step 1 */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your profile</h2>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
                                <div className="flex items-center gap-10" >
                                    <Input
                                        label="First name"
                                        required
                                        {...register("firstName", {
                                            required: "First name is required",
                                            minLength: { value: 2, message: "Minimum 2 characters" }
                                        })}
                                        error={errors.firstName}
                                        disabled={loading}
                                    />

                                    <Input
                                        label="Last name"
                                        required
                                        {...register("lastName", {
                                            required: "Last name is required",
                                            minLength: { value: 2, message: "Minimum 2 characters" }
                                        })}
                                        error={errors.lastName}
                                        disabled={loading}
                                    />
                                    <Controller
                                        name="gender"
                                        control={control}
                                        rules={{ required: "Gender is required" }}
                                        render={({ field }) => (
                                            <Select
                                                label="Gender"
                                                required
                                                options={GENDERS}
                                                error={errors.gender}
                                                {...field}
                                                disabled={loading}
                                            />
                                        )}
                                    />


                                </div>

                                <div className="flex items-center gap-10" >
                                    <Input
                                        label="Email address"
                                        type="email"
                                        required
                                        placeholder="your@email.com"
                                        autoComplete="email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Invalid email address"
                                            }
                                        })}
                                        error={errors.email}
                                        disabled={loading}
                                    />

                                    <Input
                                        label="Phone number"
                                        type="tel"
                                        required
                                        {...register("phone")}
                                        disabled={loading}
                                    />

                                    <Input
                                        label="Age"
                                        type="number"
                                        required
                                        min={18}
                                        max={100}
                                        {...register("age", {
                                            required: "Age is required",
                                            valueAsNumber: true,
                                            min: { value: 18, message: "Minimum age is 18" },
                                            max: { value: 100, message: "Maximum age is 100" },
                                        })}
                                        error={errors.age}
                                        disabled={loading}
                                    />




                                </div>

                                <Input
                                    label="LinkedIn profile"
                                    type="url"
                                    required
                                    placeholder="https://linkedin.com/in/..."
                                    {...register("linkedin", {
                                        required: "LinkedIn profile is required",
                                        pattern: {
                                            value: /^https?:\/\/.+/,
                                            message: "Invalid URL format"
                                        }
                                    })}
                                    error={errors.linkedin}
                                    disabled={loading}
                                />



                                <div>
                                    <Input
                                        label="Password"
                                        type="password"
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: { value: 8, message: "Password must be at least 8 characters" }
                                        })}
                                        error={errors.password}
                                        disabled={loading}
                                    />
                                    {password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded ${i < passwordStrength.strength ? 'bg-pink-500' : 'bg-gray-200'}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-600">{passwordStrength.label}</p>
                                        </div>
                                    )}
                                </div>

                                <Input
                                    label="Confirm password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    {...register("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: (value) => value === password || "Passwords do not match"
                                    })}
                                    error={errors.confirmPassword}
                                    disabled={loading}
                                />

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={handleStep1Next}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your company</h2>
                                <p className="text-gray-600 text-sm">Help us find the best investors for you</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
                                <Input
                                    label="Company name"
                                    required
                                    {...register("companyName", { required: "Company name is required" })}
                                    error={errors.companyName}
                                    disabled={loading}
                                />

                                <Input
                                    label="Company website"
                                    type="url"
                                    placeholder="https://yoursite.com"
                                    {...register("companyWebsite")}
                                    disabled={loading}
                                />

                                <Input
                                    label="Company LinkedIn"
                                    type="url"
                                    placeholder="https://linkedin.com/company/..."
                                    {...register("companyLinkedin")}
                                    disabled={loading}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Is the company incorporated? <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-6">
                                        {[{ val: true, label: "Yes" }, { val: false, label: "No" }].map(({ val, label }) => (
                                            <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value={String(val)}
                                                    {...register("isIncorporated")}
                                                    className="w-4 h-4 text-pink-600"
                                                    disabled={loading}
                                                />
                                                <span className="text-sm">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {isIncorporated && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Controller
                                                name="incorporationMonth"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Month"
                                                        {...field}
                                                        disabled={loading}
                                                    >
                                                        {MONTHS.map((m, i) => (
                                                            <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                                                        ))}
                                                    </Select>
                                                )}
                                            />

                                            <Input
                                                label="Year"
                                                type="number"
                                                placeholder="YYYY"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                                {...register("incorporationYear")}
                                                disabled={loading}
                                            />
                                        </div>

                                        <Controller
                                            name="incorporationCountry"
                                            control={control}
                                            rules={{ required: isIncorporated ? "Country is required" : false }}
                                            render={({ field }) => (
                                                <Select
                                                    label="Country of incorporation"
                                                    required={isIncorporated}
                                                    options={COUNTRIES}
                                                    error={errors.incorporationCountry}
                                                    {...field}
                                                    disabled={loading}
                                                />
                                            )}
                                        />
                                    </>
                                )}

                                <Controller
                                    name="companyStage"
                                    control={control}
                                    rules={{ required: "Company stage is required" }}
                                    render={({ field }) => (
                                        <Select
                                            label="Company stage"
                                            required
                                            options={STAGES}
                                            error={errors.companyStage}
                                            {...field}
                                            disabled={loading}
                                        />
                                    )}
                                />

                                <Input
                                    label="Round size ($)"
                                    type="number"
                                    placeholder="1000000"
                                    min="0"
                                    {...register("roundSize")}
                                    disabled={loading}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Keywords (3-6 required) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={keywordInput}
                                            onChange={(e) => setKeywordInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addKeyword();
                                                }
                                            }}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-pink-500 focus:border-transparent"
                                            placeholder="Type and press Enter"
                                            disabled={loading || keywords.length >= 6}
                                        />
                                        <button
                                            type="button"
                                            onClick={addKeyword}
                                            disabled={loading || !keywordInput.trim() || keywords.length >= 6}
                                            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {keywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {keywords.map((keyword: string, idx: number) => (
                                                <span key={idx} className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-1 rounded-md text-sm">
                                                    {keyword}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeKeyword(idx)}
                                                        disabled={loading}
                                                        className="hover:text-pink-900"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500">{keywords.length}/6 keywords added</p>
                                </div>

                                <Input
                                    label="Meeting link"
                                    type="url"
                                    placeholder="https://calendly.com/..."
                                    {...register("meetingLink")}
                                    disabled={loading}
                                />

                                <Input
                                    label="Pitch deck URL"
                                    type="url"
                                    placeholder="https://..."
                                    {...register("pitchDeck")}
                                    disabled={loading}
                                />

                                <Input
                                    label="Pitch video URL"
                                    type="url"
                                    placeholder="https://..."
                                    {...register("pitchVideo")}
                                    disabled={loading}
                                />

                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register("agreeToTerms")}
                                        className="w-4 h-4 text-pink-600 rounded mt-0.5"
                                        disabled={loading}
                                    />
                                    <span className="text-sm text-gray-700">
                                        I agree to the <a href="/terms" className="text-pink-600 hover:underline">Terms</a> and <a href="/privacy" className="text-pink-600 hover:underline">Privacy Policy</a> <span className="text-red-500">*</span>
                                    </span>
                                </label>

                                <div className="flex justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        disabled={loading}
                                        className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                                    >
                                        {loading ? "Submitting..." : "Submit"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3 - Success */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center bg-white rounded-2xl shadow-lg p-8"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Complete!</h2>
                            <p className="text-gray-600 mb-6">Redirecting to login...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}