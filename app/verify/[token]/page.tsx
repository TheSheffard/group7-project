"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface VerifyInfo {
  valid: boolean;
  candidateName: string;
  verificationStatus: "pending" | "awaiting_candidate" | "verified" | "failed";
  diditSessionId?: string;
  diditUrl?: string;
  expiresAt?: string;
}

export default function VerifyPage() {
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  const [info, setInfo] = useState<VerifyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/verify/info?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.valid) setError(data.error || "Invalid link");
        setInfo(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load verification");
        setLoading(false);
      });
  }, [token]);

  const simulate = async (outcome: "verified" | "failed") => {
    setBusy(true);
    try {
      const res = await fetch("/api/verify/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, outcome }),
      });
      const data = await res.json();
      if (res.ok) {
        setInfo((prev) => prev ? { ...prev, verificationStatus: data.verificationStatus } : prev);
      } else {
        setError(data.error || "Update failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  const checkStatus = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/verify/info?token=${token}`);
      const data = await res.json();
      if (data.valid) setInfo(data);
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  if (error || !info?.valid) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center px-4">
        <div className="bg-white border border-border-warm rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <h1 className="text-xl font-bold text-primary-dark mb-2">Link invalid or expired</h1>
          <p className="text-sm text-text-muted">{error || "This verification link does not exist or has already been used."}</p>
        </div>
      </div>
    );
  }

  const done = info.verificationStatus === "verified" || info.verificationStatus === "failed";

  return (
    <div className="min-h-screen bg-bg-warm flex items-center justify-center px-4 py-10">
      <div className="bg-white border border-border-warm rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">VM</span>
          <span className="font-bold text-primary-dark">VettMe Verification</span>
        </div>

        <h1 className="text-xl font-bold text-primary-dark mb-1">
          {info.verificationStatus === "verified" ? "Identity Verified ✅" :
           info.verificationStatus === "failed" ? "Verification Failed ❌" :
           "Confirm your identity"}
        </h1>
        <p className="text-sm text-text-muted mb-6">
          {info.verificationStatus === "verified"
            ? "Your face match was successful. The company will see your record as verified."
            : info.verificationStatus === "failed"
            ? "Your face match did not succeed. Contact the company that requested this vetting."
            : `Hi ${info.candidateName || "candidate"}, a company is vetting your details. Complete the face verification to confirm the NIN belongs to you.`}
        </p>

        {done ? (
          <div className={`rounded-xl p-5 text-center ${
            info.verificationStatus === "verified" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
          }`}>
            <p className={`text-sm font-medium ${
              info.verificationStatus === "verified" ? "text-emerald-800" : "text-red-800"
            }`}>
              {info.verificationStatus === "verified" ? "This link is complete." : "This link is complete."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {info.diditSessionId ? (
              <>
                <a
                  href={info.diditUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-primary text-white hover:bg-primary-dark py-3 rounded-lg font-semibold transition-colors"
                >
                  Start face verification →
                </a>
                <p className="text-xs text-text-muted text-center">
                  Opens Didit&apos;s secure verification page in a new tab.
                </p>
                <button
                  onClick={checkStatus}
                  disabled={busy}
                  className="w-full border border-border-warm text-primary-dark hover:bg-bg-warm py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {busy ? "Checking..." : "I have completed it — check status"}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-bg-warm border border-border-warm rounded-lg p-4 text-xs text-text-muted">
                  <p className="font-semibold text-primary-dark mb-1">Demo mode</p>
                  <p>Didit is not configured for this project yet. Use the buttons to simulate the candidate&apos;s face-match result.</p>
                </div>
                <button
                  onClick={() => simulate("verified")}
                  disabled={busy}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Simulate: face match successful ✅
                </button>
                <button
                  onClick={() => simulate("failed")}
                  disabled={busy}
                  className="w-full border border-red-200 text-red-700 hover:bg-red-50 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Simulate: face match failed ❌
                </button>
              </div>
            )}

            {info.expiresAt && !done && (
              <p className="text-xs text-text-muted text-center">
                Link expires {new Date(info.expiresAt).toLocaleString("en-GB")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}