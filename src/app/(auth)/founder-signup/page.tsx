"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useForm, Controller, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, ChevronDown, Eye, EyeOff, Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase";

// ─── Constants ───────────────────────────────────────────────────────────────

const MIN_BIRTH_YEAR = 1924;
const MIN_AGE = 18;
const MIN_KEYWORDS = 3;
const MAX_KEYWORDS = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const CLOUDINARY_UPLOAD_PRESET = "campaign_uploads";
const CLOUDINARY_CLOUD_NAME = "dmq8yerfd";
const currentYear = new Date().getFullYear();

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "IN", label: "India" },
  { value: "SG", label: "Singapore" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "AU", label: "Australia" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const STAGES = ["Idea", "MVP", "Early Revenue", "Growth", "Scale"];
const STEPS = ["YOUR PROFILE", "YOUR COMPANY", "FINISH"];
const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];
const BIRTH_YEARS = Array.from(
  { length: currentYear - MIN_BIRTH_YEAR + 1 },
  (_, i) => currentYear - MIN_AGE - i
);

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  linkedin: z.string().url().regex(/^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/.+/, "Must be a valid LinkedIn profile URL"),
  password: z.string().min(8).regex(/[a-z]/, "Must contain lowercase").regex(/[A-Z]/, "Must contain uppercase").regex(/\d/, "Must contain number"),
  confirmPassword: z.string(),
  birthYear: z.number().min(MIN_BIRTH_YEAR).max(currentYear - MIN_AGE, "Must be at least 18 years old"),
  gender: z.enum(["male", "female", "other"]),
  companyName: z.string().min(2).max(100),
  companyWebsite: z.string().url().optional().or(z.literal("")),
  companyLinkedin: z.string().url().regex(/^https?:\/\/(www\.)?linkedin\.com\/company\/.+/).optional().or(z.literal("")),
  companyInstagram: z.string().url().regex(/^https?:\/\/(www\.)?instagram\.com\/.+/).optional().or(z.literal("")),
  isIncorporated: z.enum(["true", "false"]),
  incorporationMonth: z.string().optional(),
  incorporationYear: z.string().optional(),
  incorporationCountry: z.string().optional(),
  companyStage: z.string().min(1),
  roundSize: z.string().optional(),
  keywords: z.array(z.string()).min(MIN_KEYWORDS).max(MAX_KEYWORDS),
  pitchDeck: z.string().min(1, "Pitch deck is required"),
  pitchDeckFileName: z.string().optional(),
  hasOnePager: z.enum(["true", "false"]),
  onePager: z.string().optional(),
  onePagerFileName: z.string().optional(),
  pitchVideo: z.string().url().regex(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/, "Must be a valid YouTube URL"),
  agreeToTerms: z.boolean().refine((v) => v === true, "Must agree to terms"),
})
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] })
  .refine((d) => d.isIncorporated !== "true" || d.incorporationCountry, { message: "Country required", path: ["incorporationCountry"] })
  .refine((d) => d.hasOnePager !== "true" || d.onePager, { message: "One pager required", path: ["onePager"] });

type FormData = z.infer<typeof schema>;

// ─── Utilities ────────────────────────────────────────────────────────────────

const sanitize = (v?: string) => v?.trim().replace(/[<>]/g, "");

const uploadToCloudinary = async (file: File): Promise<string> => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  fd.append("resource_type", "raw");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url;
};

const inputBase = "w-full px-4 py-3 border rounded-md focus:ring-1 focus:outline-none focus:border-pink-500 focus:ring-pink-500";
const borderClass = (hasError?: boolean) => hasError ? "border-red-300" : "border-gray-300";

// ─── Shared UI ────────────────────────────────────────────────────────────────

const FieldError = ({ error }: { error?: { message?: string } }) =>
  error ? (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {error.message}
    </p>
  ) : null;

const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <label className="block text-sm font-medium text-gray-700 mb-2">
    {label} {required && <span className="text-red-500">*</span>}
  </label>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: { message?: string };
}

const Input = ({ label, required, error, ...props }: InputProps) => (
  <div>
    <FieldLabel label={label} required={required} />
    <input className={`${inputBase} ${borderClass(!!error)}`} {...props} />
    <FieldError error={error} />
  </div>
);

const PasswordInput = ({ label, required, error, ...props }: InputProps) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <FieldLabel label={label} required={required} />
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className={`${inputBase} pr-12 ${borderClass(!!error)}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <FieldError error={error} />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  error?: { message?: string };
  options?: { value: string; label: string }[] | string[];
  children?: React.ReactNode;
}

const Select = ({ label, required, error, options, children, ...props }: SelectProps) => (
  <div>
    <FieldLabel label={label} required={required} />
    <select
      className={`${inputBase} bg-white ${borderClass(!!error)}`}
      {...props}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options?.map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const lbl = typeof o === "string" ? o : o.label;
        return <option key={val} value={val}>{lbl}</option>;
      })}
      {children}
    </select>
    <FieldError error={error} />
  </div>
);

interface RadioGroupProps {
  label: string;
  required?: boolean;
  name: string;
  options: { val: string; label: string }[];
  register: UseFormRegister<FormData>;
  disabled?: boolean;
}

const RadioGroup = ({ label, required, name, options, register, disabled }: RadioGroupProps) => (
  <div>
    <FieldLabel label={label} required={required} />
    <div className="flex gap-6">
      {options.map(({ val, label: optLabel }) => (
        <label key={val} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value={val}
            {...register(name as keyof FormData)}
            className="w-4 h-4 text-pink-600 focus:ring-pink-500"
            disabled={disabled}
          />
          <span className="text-sm">{optLabel}</span>
        </label>
      ))}
    </div>
  </div>
);

// ─── YearPicker ───────────────────────────────────────────────────────────────

interface YearPickerProps {
  label: string;
  required?: boolean;
  value?: number;
  onChange: (year: number) => void;
  error?: { message?: string };
  disabled?: boolean;
}

const YearPicker = ({ label, required, value, onChange, error, disabled }: YearPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = useMemo(
    () => (!search ? BIRTH_YEARS : BIRTH_YEARS.filter((y) => y.toString().includes(search))),
    [search]
  );

  return (
    <div ref={ref} className="relative">
      <FieldLabel label={label} required={required} />
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        className={`${inputBase} flex items-center justify-between bg-white ${borderClass(!!error)} ${disabled ? "opacity-50" : "hover:border-pink-400"}`}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? `${value} (Age: ${currentYear - value})` : "Select birth year"}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <FieldError error={error} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden"
          >
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search year..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div className="overflow-y-auto max-h-52 p-2">
              {filtered.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => { onChange(y); setIsOpen(false); setSearch(""); }}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    value === y ? "bg-pink-100 text-pink-700 font-medium" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="font-medium">{y}</span>
                  <span className="text-sm text-gray-500 ml-2">(Age: {currentYear - y})</span>
                </button>
              ))}
              {!filtered.length && <p className="text-center text-gray-500 py-4 text-sm">No years found</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── FileUpload ───────────────────────────────────────────────────────────────

interface FileUploadProps {
  label: string;
  required?: boolean;
  onUpload: (url: string, fileName: string) => void;
  error?: { message?: string };
  disabled?: boolean;
  currentFile?: string;
}

const FileUpload = ({ label, required, onUpload, error, disabled, currentFile }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return alert("Only PDF files allowed");
    if (file.size > MAX_FILE_SIZE) return alert("File must be < 10MB");
    setUploading(true);
    setFileName(file.name);
    try {
      const url = await uploadToCloudinary(file);
      onUpload(url, file.name);
    } catch {
      alert("Upload failed");
      setFileName("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <FieldLabel label={label} required={required} />
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          error ? "border-red-300" : "border-gray-300 hover:border-pink-400"
        } ${disabled ? "opacity-50" : "cursor-pointer"}`}
        onClick={() => !disabled && !uploading && ref.current?.click()}
      >
        <input ref={ref} type="file" accept=".pdf" onChange={handleChange} className="hidden" disabled={disabled || uploading} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : currentFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-green-500" />
            <p className="text-sm text-gray-700 font-medium">{fileName || "File uploaded"}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); ref.current?.click(); }}
              className="text-xs text-pink-600 hover:text-pink-700"
            >
              Change file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600">Click to upload PDF</p>
            <p className="text-xs text-gray-500">Max size: 10MB</p>
          </div>
        )}
      </div>
      <FieldError error={error} />
    </div>
  );
};

// ─── Misc UI ──────────────────────────────────────────────────────────────────

const StatusMessage = ({ type, text }: { type: "error" | "success"; text: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-4 rounded-lg mb-6 flex items-center gap-2 border ${
      type === "error"
        ? "bg-red-50 text-red-800 border-red-200"
        : "bg-green-50 text-green-800 border-green-200"
    }`}
  >
    {type === "error" ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
    <span className="font-medium">{text}</span>
  </motion.div>
);

const ProgressIndicator = ({ step }: { step: number }) => (
  <div className="flex items-center justify-center mb-8">
    <div className="flex items-center">
      {[1, 2, 3].map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= s ? "bg-pink-500" : "bg-gray-300"}`}>
            {step > s ? <Check className="w-5 h-5 text-white" /> : <span className="text-white font-semibold">{s}</span>}
          </div>
          {i < 2 && <div className={`w-24 h-1 ${step > s ? "bg-pink-500" : "bg-gray-300"}`} />}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const PrimaryButton = ({ loading, label, loadingLabel, onClick, type = "button" }: {
  loading?: boolean;
  label: string;
  loadingLabel?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-2"
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {loading ? (loadingLabel ?? label) : label}
  </button>
);

const SecondaryButton = ({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
  >
    {label}
  </button>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">{children}</div>
);

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function FounderSignupForm() {
  const [step, setStep] = useState(1);
  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "", linkedin: "",
      password: "", confirmPassword: "", companyName: "", companyWebsite: "",
      companyLinkedin: "", companyInstagram: "", isIncorporated: "false",
      incorporationMonth: "", incorporationYear: "", incorporationCountry: "",
      companyStage: "", roundSize: "", keywords: [], agreeToTerms: false,
      pitchDeck: "", pitchDeckFileName: "", hasOnePager: "false",
      onePager: "", onePagerFileName: "", pitchVideo: "",
      gender: undefined as any, birthYear: undefined as any,
    },
  });

  const password = watch("password");
  const keywords = watch("keywords") as string[];
  const isIncorporated = watch("isIncorporated");
  const hasOnePager = watch("hasOnePager");
  const pitchDeck = watch("pitchDeck");
  const onePager = watch("onePager");

  const showError = (text: string) => {
    setMessage({ type: "error", text });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep1Next = async () => {
    setMessage(null);
    const valid = await trigger(["firstName","lastName","email","phone","linkedin","password","confirmPassword","birthYear","gender"]);
    if (valid) setStep(2);
    else showError("Please fix the errors below");
  };

  const onSubmit = async (data: FormData) => {
    setMessage(null);
    if (data.keywords.length < MIN_KEYWORDS) return showError(`Add at least ${MIN_KEYWORDS} keywords`);
    setLoading(true);

    let firebaseUser: any = null;

    try {
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email.toLowerCase().trim(),
        data.password
      ).catch((err: any) => {
        const errorMap: Record<string, string> = {
          "auth/email-already-in-use": "Email already registered",
          "auth/weak-password": "Password is too weak",
          "auth/invalid-email": "Invalid email address",
        };
        throw new Error(errorMap[err.code] ?? "Failed to create account");
      });

      firebaseUser = userCredential.user;

      // Step 2: Update display name
      await updateProfile(firebaseUser, {
        displayName: `${data.firstName.trim()} ${data.lastName.trim()}`,
      });

      const currentYear = new Date().getFullYear();
      const incorporated = data.isIncorporated === "true";

      // Step 3: Parse incorporation date
      let incorporationDate: string | null = null;
      if (incorporated && data.incorporationMonth && data.incorporationYear) {
        incorporationDate = new Date(
          parseInt(data.incorporationYear),
          parseInt(data.incorporationMonth) - 1,
          1
        ).toISOString();
      }

      // Step 4: Write founder profile to Firestore
      const founderDoc = {
        uid: firebaseUser.uid,
        firstName: sanitize(data.firstName)!,
        lastName: sanitize(data.lastName)!,
        email: data.email.toLowerCase().trim(),
        phone: sanitize(data.phone) || null,
        linkedin: sanitize(data.linkedin) || null,
        gender: data.gender,
        birthYear: Number(data.birthYear),
        age: currentYear - Number(data.birthYear),
        companyName: sanitize(data.companyName)!,
        companyWebsite: data.companyWebsite ? sanitize(data.companyWebsite) || null : null,
        companyLinkedin: data.companyLinkedin ? sanitize(data.companyLinkedin) || null : null,
        companyInstagram: data.companyInstagram ? sanitize(data.companyInstagram) || null : null,
        isIncorporated: incorporated,
        incorporationDate,
        incorporationCountry: incorporated ? data.incorporationCountry?.trim() || null : null,
        companyStage: data.companyStage,
        roundSize: data.roundSize ? Number(data.roundSize) : null,
        keywords: data.keywords.map((k) => sanitize(k)!.toLowerCase()),
        pitchDeck: data.pitchDeck,
        pitchDeckFileName: data.pitchDeckFileName || null,
        onePager: incorporated && data.onePager ? data.onePager : null,
        onePagerFileName: incorporated && data.onePagerFileName ? data.onePagerFileName : null,
        pitchVideo: sanitize(data.pitchVideo)!,
        role: "founder",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "founders", firebaseUser.uid), founderDoc);

      setMessage({ type: "success", text: "Account created! Redirecting..." });
      setStep(3);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err: any) {
      // Rollback: delete Firebase Auth user if Firestore write failed
      if (firebaseUser) {
        try { await firebaseUser.delete(); } catch {}
      }
      showError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    const trimmed = sanitize(keywordInput);
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase();
    if (keywords.length < MAX_KEYWORDS && !keywords.some((k) => k.toLowerCase() === normalized)) {
      setValue("keywords", [...keywords, trimmed], { shouldValidate: true });
      setKeywordInput("");
    }
  };

  const removeKeyword = (i: number) =>
    setValue("keywords", keywords.filter((_, idx) => idx !== i), { shouldValidate: true });

  const passwordStrength = useMemo(() => {
    if (!password) return { strength: 0, label: "", color: "bg-gray-200" };
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    const cfg = [
      { label: "", color: "bg-gray-200" },
      { label: "Weak", color: "bg-red-500" },
      { label: "Fair", color: "bg-orange-500" },
      { label: "Good", color: "bg-yellow-500" },
      { label: "Strong", color: "bg-green-500" },
      { label: "Very Strong", color: "bg-green-600" },
    ];
    return { strength: s, ...cfg[s] };
  }, [password]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-3xl mx-auto">
        {step < 3 && (
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-pink-700 gap-1 mb-4 hover:text-pink-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        )}

        <ProgressIndicator step={step} />

        <div className="flex items-center justify-center gap-8 mb-8 text-xs">
          {STEPS.map((label, i) => (
            <span key={label} className={`font-medium ${step === i + 1 ? "text-pink-500" : "text-gray-500"}`}>
              {label}
            </span>
          ))}
        </div>

        {message && <StatusMessage type={message.type} text={message.text} />}

        <AnimatePresence mode="wait">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Create your profile</h2>
              </div>
              <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="First name" required {...register("firstName")} error={errors.firstName} disabled={loading} />
                  <Input label="Last name" required {...register("lastName")} error={errors.lastName} disabled={loading} />
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select label="Gender" required options={GENDERS} error={errors.gender} {...field} disabled={loading} />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Email" type="email" required placeholder="your@email.com" {...register("email")} error={errors.email} disabled={loading} />
                  <Input label="Phone" type="tel" required placeholder="+1234567890" {...register("phone")} error={errors.phone} disabled={loading} />
                  <Controller
                    name="birthYear"
                    control={control}
                    render={({ field }) => (
                      <YearPicker label="Birth year" required value={field.value} onChange={field.onChange} error={errors.birthYear} disabled={loading} />
                    )}
                  />
                </div>

                <Input label="LinkedIn profile" type="url" required placeholder="https://linkedin.com/in/yourprofile" {...register("linkedin")} error={errors.linkedin} disabled={loading} />

                <div>
                  <PasswordInput label="Password" required {...register("password")} error={errors.password} disabled={loading} />
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`h-1 flex-1 rounded ${i < passwordStrength.strength ? passwordStrength.color : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">{passwordStrength.label}</p>
                    </div>
                  )}
                </div>

                <PasswordInput label="Confirm password" required {...register("confirmPassword")} error={errors.confirmPassword} disabled={loading} />

                <div className="flex justify-end pt-4">
                  <PrimaryButton label="Next" onClick={handleStep1Next} loading={loading} />
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your company</h2>
                <p className="text-gray-600 text-sm">Help us find the best investors</p>
              </div>
              <Card>
                <Input label="Company name" required {...register("companyName")} error={errors.companyName} disabled={loading} />
                <Input label="Company website" type="url" placeholder="https://yourcompany.com" {...register("companyWebsite")} error={errors.companyWebsite} disabled={loading} />
                <Input label="Company LinkedIn" type="url" placeholder="https://linkedin.com/company/yourcompany" {...register("companyLinkedin")} error={errors.companyLinkedin} disabled={loading} />
                <Input label="Company Instagram" type="url" placeholder="https://instagram.com/yourprofile" {...register("companyInstagram")} error={errors.companyInstagram} disabled={loading} />

                <RadioGroup
                  label="Is the company incorporated?"
                  required
                  name="isIncorporated"
                  options={[{ val: "true", label: "Yes" }, { val: "false", label: "No" }]}
                  register={register}
                  disabled={loading}
                />

                {isIncorporated === "true" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="incorporationMonth"
                        control={control}
                        render={({ field }) => (
                          <Select label="Month" {...field} disabled={loading}>
                            {MONTHS.map((m, i) => (
                              <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                            ))}
                          </Select>
                        )}
                      />
                      <Input label="Year" type="number" placeholder="YYYY" min="1900" max={currentYear} {...register("incorporationYear")} disabled={loading} />
                    </div>
                    <Controller
                      name="incorporationCountry"
                      control={control}
                      render={({ field }) => (
                        <Select label="Country of incorporation" required options={COUNTRIES} error={errors.incorporationCountry} {...field} disabled={loading} />
                      )}
                    />
                    <Input label="Round size ($)" type="number" placeholder="1000000" min="0" {...register("roundSize")} disabled={loading} />
                  </>
                )}

                <Controller
                  name="companyStage"
                  control={control}
                  render={({ field }) => (
                    <Select label="Company stage" required options={STAGES} error={errors.companyStage} {...field} disabled={loading} />
                  )}
                />

                {/* Keywords */}
                <div>
                  <FieldLabel label={`Keywords (${MIN_KEYWORDS}–${MAX_KEYWORDS} required)`} required />
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                      className={`${inputBase} flex-1`}
                      placeholder="e.g., AI, SaaS, B2B"
                      disabled={loading || keywords.length >= MAX_KEYWORDS}
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      disabled={loading || !keywordInput.trim() || keywords.length >= MAX_KEYWORDS}
                      className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {keywords.map((k, i) => (
                        <span key={i} className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-1 rounded-md text-sm">
                          {k}
                          <button type="button" onClick={() => removeKeyword(i)} disabled={loading} className="hover:text-pink-900">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">{keywords.length}/{MAX_KEYWORDS} keywords (min {MIN_KEYWORDS})</p>
                  <FieldError error={errors.keywords as any} />
                </div>

                <FileUpload
                  label="Pitch deck (PDF)"
                  required
                  onUpload={(url, fileName) => { setValue("pitchDeck", url, { shouldValidate: true }); setValue("pitchDeckFileName", fileName); }}
                  error={errors.pitchDeck}
                  disabled={loading}
                  currentFile={pitchDeck}
                />

                <RadioGroup
                  label="Do you have a one-pager?"
                  name="hasOnePager"
                  options={[{ val: "true", label: "Yes" }, { val: "false", label: "No" }]}
                  register={register}
                  disabled={loading}
                />

                {hasOnePager === "true" && (
                  <FileUpload
                    label="One-pager (PDF)"
                    required
                    onUpload={(url, fileName) => { setValue("onePager", url, { shouldValidate: true }); setValue("onePagerFileName", fileName); }}
                    error={errors.onePager}
                    disabled={loading}
                    currentFile={onePager}
                  />
                )}

                <Input label="Pitch YouTube video URL" required type="url" placeholder="https://youtube.com/watch?v=..." {...register("pitchVideo")} error={errors.pitchVideo} disabled={loading} />

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" {...register("agreeToTerms")} className="w-4 h-4 text-pink-600 rounded mt-0.5 focus:ring-pink-500" disabled={loading} />
                  <span className="text-sm text-gray-700">
                    I agree to the{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">Terms</a>
                    {" "}and{" "}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">Privacy Policy</a>
                    {" "}<span className="text-red-500">*</span>
                  </span>
                </label>
                <FieldError error={errors.agreeToTerms} />

                <div className="flex justify-between pt-4">
                  <SecondaryButton label="Back" onClick={() => setStep(1)} disabled={loading} />
                  <PrimaryButton label="Submit" loadingLabel="Submitting..." loading={loading} onClick={handleSubmit(onSubmit)} />
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white rounded-2xl shadow-lg p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Complete!</h2>
              <p className="text-gray-600 mb-2">Your account has been created successfully.</p>
              <p className="text-gray-600 mb-6">Please check your email for verification instructions.</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}