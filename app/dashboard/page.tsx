// DashboardPage.tsx
"use client";

import { useState, useCallback } from "react";
import {
  ArrowRight,
  Clock,
  Database,
  ShieldAlert,
  Loader2,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import VettingForm, { type VettingFormData } from "@/components/VettingForm";
import VettingResult from "@/components/VettingResult";

interface ValidateResponse {
  id?: string;
  duplicate?: boolean;
  saved?: boolean;
  results: {
    component: string;
    valid: boolean;
    reason: string;
    score: number;
    details?: Record<string, unknown>;
  }[];
  overallVerdict: "verified" | "needs_review" | "failed";
  overallScore: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ValidateResponse | null>(null);
  const [error, setError] = useState("");

  const handleVetting = useCallback(async (data: VettingFormData) => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": data.idempotencyKey,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Validation failed");
        setLoading(false);
        return;
      }

      setResponse(json);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const closeError = () => setError("");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-18 sm:py-28">
        {/* Header */}
        <div className="mb-8 ">
          <h1 className="text-2xl  font-bold text-slate-800 sm:text-3xl">
            New Vetting
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter the candidate&apos;s details to run validation checks.
          </p>
        </div>

        {/* Form card */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <VettingForm onSubmit={handleVetting} loading={loading} />
        </div>

        {/* Results area */}
        {response && (
          <div className="space-y-6 animate-fadeIn">
            {/* Idempotency notice */}
            {response.duplicate && (
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <Database className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  This submission was already processed — showing cached result
                  (idempotency).
                </span>
              </div>
            )}

            {/* Not saved warning */}
            {response.saved === false && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Record not saved to history</p>
                  <p className="text-amber-600/90">
                    This candidate failed one or more checks, so the vetting was{" "}
                    <strong>not</strong> stored. Fix the issues and try again.
                  </p>
                </div>
              </div>
            )}

            {/* Results */}
            {response.results && (
              <VettingResult
                results={response.results}
                overallVerdict={response.overallVerdict}
                overallScore={response.overallScore}
              />
            )}

            {/* Action footer */}
            <div className="flex justify-end border-t border-slate-200 pt-6">
              <button
                onClick={() => {
                  setResponse(null);
                  setError("");
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800"
              >
                Start New Vetting
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Error Modal Popup */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-200/80 animate-scaleIn">
            {/* Close button */}
            <button
              onClick={closeError}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Close error"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-rose-800">
                  Validation failed
                </h3>
                <p className="mt-1 text-sm text-rose-700/90">{error}</p>
                <button
                  onClick={closeError}
                  className="mt-4 rounded-lg bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
