// VettingForm.tsx
"use client";

import { useState } from "react";
import {
    User,
    IdCard,
    Phone,
    Mail,
    MapPin,
    Building2,
    Image,
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
} from "lucide-react";

export interface VettingFormData {
    candidateName: string;
    nin: string;
    phone: string;
    email: string;
    stateOfOrigin: string;
    bvn: string;
    ninCardPhoto?: string;
    idempotencyKey: string;
}

/* ---------- Quick-fill test profiles (developer convenience) ---------- */
type TestProfileData = Omit<VettingFormData, "idempotencyKey" | "bvn"> & {
    bvn?: string;
};

function makePlaceholderPhoto(label = "NIN"): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" fill="#e2e8f0"/><rect x="6" y="6" width="88" height="48" fill="#cbd5e1"/><text x="50" y="34" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="#475569">${label}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface TestProfile {
    label: string;
    variant: "pass" | "fail";
    data: TestProfileData;
}

const TEST_PROFILES: TestProfile[] = [
    {
        label: "Adebayo Okafor (passes)",
        variant: "pass",
        data: {
            candidateName: "Adebayo Okafor",
            nin: "12345678901",
            phone: "+2348030000001",
            email: "adebayo.okafor@example.com",
            stateOfOrigin: "Lagos",
            ninCardPhoto: makePlaceholderPhoto("NIN"),
        },
    },
    {
        label: "Bad data (fails)",
        variant: "fail",
        data: {
            candidateName: "Unknown Person",
            nin: "99999999999",
            phone: "+2348030099999",
            email: "user@mailinator.com",
            stateOfOrigin: "Kano",
            ninCardPhoto: makePlaceholderPhoto("NIN"),
        },
    },
];

interface VettingFormProps {
    onSubmit: (data: VettingFormData) => void;
    loading: boolean;
}

export default function VettingForm({ onSubmit, loading }: VettingFormProps) {
    // Idempotency key - generated once per form mount
    const [idempotencyKey] = useState(() => {
        try {
            return crypto.randomUUID();
        } catch {
            return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
    });

    const [form, setForm] = useState<VettingFormData>({
        candidateName: "",
        nin: "",
        phone: "",
        email: "",
        stateOfOrigin: "",
        bvn: "",
        idempotencyKey,
    });
    const [consent, setConsent] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<
        Partial<Record<keyof VettingFormData, string>>
    >({});

    const handlePhoto = (file: File | null) => {
        if (!file) {
            setPhotoPreview(null);
            setForm((f) => ({ ...f, ninCardPhoto: undefined }));
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setErrors((e) => ({ ...e, ninCardPhoto: "Photo must be under 2MB" }));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result);
            setPhotoPreview(dataUrl);
            setForm((f) => ({ ...f, ninCardPhoto: dataUrl }));
        };
        reader.readAsDataURL(file);
    };

    const applyTestProfile = (profile: TestProfile) => {
        setForm((f) => ({
            ...f,
            candidateName: profile.data.candidateName ?? "",
            nin: profile.data.nin ?? "",
            phone: profile.data.phone ?? "",
            email: profile.data.email ?? "",
            stateOfOrigin: profile.data.stateOfOrigin ?? "",
            bvn: profile.data.bvn ?? "",
            ninCardPhoto: profile.data.ninCardPhoto,
        }));
        setPhotoPreview(profile.data.ninCardPhoto ?? null);
        setErrors({});
        setConsent(true);
    };

    const validate = (): boolean => {
        const newErrors: typeof errors = {};
        if (!form.candidateName.trim())
            newErrors.candidateName = "Candidate name is required";
        if (!/^\d{11}$/.test(form.nin.replace(/\s/g, "")))
            newErrors.nin = "NIN must be exactly 11 digits";

        const cleanedPhone = form.phone.replace(/[\s\-()]/g, "");
        if (!form.phone.trim()) {
            newErrors.phone = "Phone is required";
        } else if (!/^(\+?234\d{10}|0\d{10})$/.test(cleanedPhone)) {
            newErrors.phone =
                "Enter a valid Nigerian number (e.g. 08031234567 or +2348031234567)";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = "Valid email is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !consent) return;
        onSubmit(form);
    };

    // Input styling with error state
    const inputStyles = (field: keyof VettingFormData) => {
        const base =
            "w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none text-sm bg-white";
        if (errors[field]) {
            return `${base} border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200`;
        }
        return `${base} border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 hover:border-slate-300`;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick-fill test profiles */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-400 mr-1">
                    Quick fill:
                </span>
                {TEST_PROFILES.map((p) => (
                    <button
                        key={p.label}
                        type="button"
                        onClick={() => applyTestProfile(p)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            p.variant === "fail"
                                ? "border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
                                : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Candidate Name - full width */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4 text-slate-400" />
                            Candidate Full Name
                            <span className="text-rose-400">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Adebayo Okafor"
                        className={inputStyles("candidateName")}
                        value={form.candidateName}
                        onChange={(e) =>
                            setForm({ ...form, candidateName: e.target.value })
                        }
                    />
                    {errors.candidateName && (
                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.candidateName}
                        </p>
                    )}
                </div>

                {/* NIN */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <IdCard className="h-4 w-4 text-slate-400" />
                            NIN
                            <span className="text-rose-400">*</span>
                            <span className="text-slate-400 text-xs font-normal ml-1">
                                (11 digits)
                            </span>
                        </span>
                    </label>
                    <input
                        type="text"
                        placeholder="12345678901"
                        maxLength={11}
                        className={inputStyles("nin")}
                        value={form.nin}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                nin: e.target.value.replace(/\D/g, "").slice(0, 11),
                            })
                        }
                    />
                    {errors.nin && (
                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.nin}
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4 text-slate-400" />
                            Phone Number
                            <span className="text-rose-400">*</span>
                        </span>
                    </label>
                    <input
                        type="tel"
                        placeholder="+234 801 234 5678"
                        className={inputStyles("phone")}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                    {errors.phone && (
                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.phone}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4 text-slate-400" />
                            Email Address
                            <span className="text-rose-400">*</span>
                        </span>
                    </label>
                    <input
                        type="email"
                        placeholder="candidate@example.com"
                        className={inputStyles("email")}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    {errors.email && (
                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* State of Origin */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            State of Origin
                            <span className="text-slate-400 text-xs font-normal ml-1">
                                (optional)
                            </span>
                        </span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Lagos"
                        className={inputStyles("stateOfOrigin")}
                        value={form.stateOfOrigin}
                        onChange={(e) =>
                            setForm({ ...form, stateOfOrigin: e.target.value })
                        }
                    />
                </div>

                {/* BVN */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            BVN
                            <span className="text-slate-400 text-xs font-normal ml-1">
                                (optional)
                            </span>
                        </span>
                    </label>
                    <input
                        type="text"
                        placeholder="12345678901"
                        maxLength={11}
                        className={inputStyles("bvn")}
                        value={form.bvn}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                bvn: e.target.value.replace(/\D/g, "").slice(0, 11),
                            })
                        }
                    />
                </div>

                {/* NIN card photo */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <Image className="h-4 w-4 text-slate-400" />
                            NIN Card Photo
                            <span className="text-slate-400 text-xs font-normal ml-1">
                                (upload the candidate&apos;s NIN card)
                            </span>
                        </span>
                    </label>
                    <div className="flex items-start gap-4">
                        <label className="flex-1 cursor-pointer border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors bg-slate-50/50 hover:bg-white">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handlePhoto(e.target.files?.[0] || null)}
                            />
                            <div className="flex flex-col items-center gap-1">
                                <Upload className="h-6 w-6 text-slate-400" />
                                <span className="text-sm text-slate-500">
                                    {photoPreview
                                        ? "Change photo"
                                        : "Click to upload NIN card photo"}
                                </span>
                            </div>
                        </label>
                        {photoPreview && (
                            <img
                                src={photoPreview}
                                alt="NIN card preview"
                                className="h-20 w-28 object-cover rounded-lg border border-slate-200 shadow-sm"
                            />
                        )}
                    </div>
                    {errors.ninCardPhoto && (
                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.ninCardPhoto}
                        </p>
                    )}
                </div>
            </div>

            {/* Consent */}
            <div className="bg-slate-50/80 rounded-lg p-4 border border-slate-200/60">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 transition"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors leading-relaxed">
                        I confirm that the individual being vetted has consented to this
                        identity verification — NIN/BVN lookup and face verification (NDPA
                        compliant).
                    </span>
                </label>
            </div>

            {/* Submit button */}
            <button
                type="submit"
                disabled={loading || !consent}
                className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all duration-200 ${
                    loading || !consent
                        ? "bg-slate-300 cursor-not-allowed shadow-none"
                        : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-lg shadow-emerald-200/40 hover:shadow-emerald-200/60"
                }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Running validation…
                    </span>
                ) : (
                    "Run Vetting"
                )}
            </button>
        </form>
    );
}