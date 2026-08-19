"use client";

import { useState } from "react";

export interface VettingFormData {
  candidateName: string;
  nin: string;
  phone: string;
  email: string;
  stateOfOrigin: string;
  bvn: string;
  idempotencyKey: string;
}

/* ---------- Quick-fill test profiles (developer convenience) ---------- */
type TestProfileData = Omit<VettingFormData, "idempotencyKey" | "bvn"> & { bvn?: string };

interface TestProfile {
  label: string;
  emoji: string;
  variant: "pass" | "fail";
  data: TestProfileData;
}

const TEST_PROFILES: TestProfile[] = [
  { label: "Adebayo Okafor", emoji: "✅", variant: "pass",
    data: { candidateName: "Adebayo Okafor", nin: "12345678901", phone: "+2348030000001", email: "adebayo.okafor@example.com", stateOfOrigin: "Lagos" } },

  { label: "Bad data (fails)", emoji: "❌", variant: "fail",
    data: { candidateName: "Unknown Person", nin: "99999999999", phone: "+2348030099999", email: "user@mailinator.com", stateOfOrigin: "Kano" } },
];

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue",
  "Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu",
  "Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi",
  "Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo",
  "Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT",
];

interface VettingFormProps {
  onSubmit: (data: VettingFormData) => void;
  loading: boolean;
}

export default function VettingForm({ onSubmit, loading }: VettingFormProps) {
  // Idempotency key - generated once per form mount so re-submits/retries
  // never create duplicate vetting records.
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
  const [errors, setErrors] = useState<Partial<Record<keyof VettingFormData, string>>>({});

  const applyTestProfile = (profile: TestProfile) => {
    setForm((f) => ({
      ...f,
      candidateName: profile.data.candidateName ?? "",
      nin: profile.data.nin ?? "",
      phone: profile.data.phone ?? "",
      email: profile.data.email ?? "",
      stateOfOrigin: profile.data.stateOfOrigin ?? "",
      bvn: profile.data.bvn ?? "",
    }));
    setErrors({});
    setConsent(true);
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.candidateName.trim()) newErrors.candidateName = "Candidate name is required";
    else if (/\d/.test(form.candidateName)) newErrors.candidateName = "Name should not contain numbers";
    if (!/^\d{11}$/.test(form.nin.replace(/\s/g, ""))) newErrors.nin = "NIN must be exactly 11 digits";

    // Strip non-formatting characters for regex check
    const cleanedPhone = form.phone.replace(/[\s\-()]/g, "");
    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (/[a-zA-Z]/.test(form.phone)) {
      newErrors.phone = "Phone number should not contain letters";
    } else if (!/^(\+?234\d{10}|0\d{10})$/.test(cleanedPhone)) {
      newErrors.phone = "Enter a valid Nigerian number (e.g. 08031234567 or +2348031234567)";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Valid email is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !consent) return;
    onSubmit(form);
  };

  const inputStyles = (field: keyof VettingFormData) => {
    const base =
      "w-full px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none text-sm bg-white/50 backdrop-blur-sm";
    if (errors[field]) {
      return `${base} border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200`;
    }
    return `${base} border-border-warm focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50`;
  };

  const selectStyles = (field: keyof VettingFormData) => {
    const base =
      "w-full px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none text-sm bg-white/50 backdrop-blur-sm appearance-none";
    if (errors[field]) {
      return `${base} border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200`;
    }
    return `${base} border-border-warm focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick-fill test profiles */}
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-xs font-medium text-text-muted mr-1">Quick fill:</span>
        {TEST_PROFILES.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyTestProfile(p)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              p.variant === "fail"
                ? "border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                : "border-border-warm bg-bg-warm/50 text-primary-dark hover:border-primary hover:bg-white"
            }`}
          >
            <span className="mr-1">{p.emoji}</span>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Candidate Name - full width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            Candidate Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Adebayo Okafor"
            className={inputStyles("candidateName")}
            value={form.candidateName}
            onChange={(e) => setForm({ ...form, candidateName: e.target.value.replace(/\d/g, "") })}
          />
          {errors.candidateName && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
              {errors.candidateName}
            </p>
          )}
        </div>

        {/* NIN */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            NIN <span className="text-red-400">*</span>
            <span className="text-text-muted text-xs font-normal ml-1">(11 digits)</span>
          </label>
          <input
            type="text"
            placeholder="12345678901"
            maxLength={11}
            className={inputStyles("nin")}
            value={form.nin}
            onChange={(e) => setForm({ ...form, nin: e.target.value.replace(/\D/g, "").slice(0, 11) })}
          />
          {errors.nin && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
              {errors.nin}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            placeholder="+234 801 234 5678"
            className={inputStyles("phone")}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[a-zA-Z]/g, "") })}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            placeholder="candidate@example.com"
            className={inputStyles("email")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
              {errors.email}
            </p>
          )}
        </div>

        {/* State of Origin */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            State of Origin <span className="text-text-muted text-xs font-normal">(optional)</span>
          </label>
          <select
            className={selectStyles("stateOfOrigin")}
            value={form.stateOfOrigin}
            onChange={(e) => setForm({ ...form, stateOfOrigin: e.target.value })}
          >
            <option value="">Select state (optional)</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* BVN */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            BVN <span className="text-text-muted text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="12345678901"
            maxLength={11}
            className={inputStyles("bvn")}
            value={form.bvn}
            onChange={(e) => setForm({ ...form, bvn: e.target.value.replace(/\D/g, "").slice(0, 11) })}
          />
        </div>
      </div>

      {/* Consent */}
      <div className="bg-bg-warm/60 rounded-xl p-4 border border-border-warm">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border-warm text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 transition"
          />
          <span className="text-sm text-text-muted group-hover:text-foreground transition-colors leading-relaxed">
            I confirm that the individual being vetted has consented to this identity
            verification (NDPA compliant).
          </span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !consent}
        className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 ${
          loading || !consent
            ? "bg-primary/30 cursor-not-allowed shadow-none"
            : "bg-primary hover:bg-primary-dark active:scale-[0.98] shadow-lg shadow-primary/20 hover:shadow-primary/30"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Running validation…
          </span>
        ) : (
          "Run Vetting"
        )}
      </button>
    </form>
  );
}