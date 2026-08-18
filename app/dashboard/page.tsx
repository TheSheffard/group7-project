"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import VettingForm, { type VettingFormData } from "@/components/VettingForm";
import VettingResult from "@/components/VettingResult";

interface ValidateResponse {
  id?: string;
  duplicate?: boolean;
  saved?: boolean;
  verifyToken: string;
  verificationStatus: "pending" | "awaiting_candidate" | "verified" | "failed";
  verificationLink: string;
  diditUrl: string | null;
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
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        // Server rejected the input with a clear error message
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

  // Poll verification status while awaiting the candidate
  useEffect(() => {
    if (response && response.verificationStatus === "awaiting_candidate") {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/verify/status?id=${response.id}`);
          const data = await res.json();
          if (data.verificationStatus !== "awaiting_candidate") {
            setResponse((prev) => prev ? { ...prev, verificationStatus: data.verificationStatus } : prev);
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch {
          // keep polling
        }
      }, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [response]);

  const copyLink = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response.verificationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-bg-warm text-text-muted",
      awaiting_candidate: "bg-amber-100 text-amber-700",
      verified: "bg-emerald-100 text-emerald-700",
      failed: "bg-red-100 text-red-700",
    };
    const label: Record<string, string> = {
      pending: "Pending",
      awaiting_candidate: "Awaiting candidate",
      verified: "Verified",
      failed: "Failed",
    };
    return (
      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${map[s] || map.pending}`}>
        {label[s] || s}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-bg-warm">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary-dark">New Vetting</h1>
          <p className="text-text-muted text-sm mt-1">
            Enter the candidate&apos;s details and upload their NIN card. They&apos;ll receive a
            link to confirm their identity.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-4 mb-6">
            {error}
          </div>
        )}

        <div className="bg-white border border-border-warm rounded-2xl p-6 md:p-8 shadow-sm mb-8">
          <VettingForm onSubmit={handleVetting} loading={loading} />
        </div>

        {response && (
          <div className="space-y-6 animate-fadeIn">
            {/* NOT SAVED warning */}
            {response.saved === false && (
              <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-2xl p-5 shadow-sm">
                <p className="font-semibold mb-1">⚠️ Record not saved to history</p>
                <p className="text-sm">
                  This candidate failed one or more checks, so the vetting was <strong>not</strong> stored
                  in the database. Fix the issues and try again.
                </p>
              </div>
            )}

            {/* Verification status card */}
            {response.saved !== false && (
            <div className="bg-white border border-border-warm rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-primary-dark">Identity Verification</h2>
                {statusBadge(response.verificationStatus)}
              </div>

              {response.duplicate && (
                <p className="text-xs text-text-muted bg-bg-warm rounded-lg px-3 py-2 mb-4">
                  ℹ️ This submission was already processed — showing the existing result
                  (idempotency).
                </p>
              )}

              {response.verificationStatus === "awaiting_candidate" && (
                <>
                  <p className="text-sm text-text-muted mb-4">
                    Send this link to the candidate. They&apos;ll complete a live face
                    verification to confirm the NIN belongs to them.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-bg-warm border border-border-warm rounded-lg px-4 py-2.5 text-xs text-primary-dark overflow-x-auto whitespace-nowrap">
                      {response.verificationLink}
                    </code>
                    <button
                      onClick={copyLink}
                      className="bg-primary text-white hover:bg-primary-dark px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      {copied ? "Copied ✓" : "Copy link"}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-3">
                    ⏳ Waiting for the candidate to complete verification — this page
                    refreshes automatically.
                  </p>
                  {!response.diditUrl && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      Demo mode: Didit is not connected, so the candidate page shows
                      simulated buttons. Add DIDIT_WORKFLOW_ID to .env.local for real
                      live face capture.
                    </p>
                  )}
                </>
              )}

              {response.verificationStatus === "verified" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm text-emerald-800 font-medium">
                  ✅ The candidate completed the face verification successfully.
                  This NIN is confirmed to belong to them.
                </div>
              )}

              {response.verificationStatus === "failed" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-800 font-medium">
                  ❌ The candidate&apos;s face verification failed. Review this vetting
                  manually before proceeding.
                </div>
              )}

              {response.diditUrl && (
                <a
                  href={response.diditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm text-primary-light hover:text-primary font-medium"
                >
                  Open Didit verification page →
                </a>
              )}
            </div>
            )}

            {/* Sync checks result */}
            <VettingResult
              results={response.results}
              overallVerdict={response.overallVerdict}
              overallScore={response.overallScore}
            />
          </div>
        )}
      </main>
    </div>
  );
}