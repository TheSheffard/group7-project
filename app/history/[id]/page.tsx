"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import VettingResult from "@/components/VettingResult";

interface VettingDetail {
  _id: string;
  candidateName: string;
  nin: string;
  phone: string;
  email: string;
  stateOfOrigin?: string;
  bvn?: string;
  results: {
    component: string;
    valid: boolean;
    reason: string;
    score: number;
    details?: Record<string, unknown>;
  }[];
  overallVerdict: "verified" | "needs_review" | "failed";
  overallScore?: number;
  createdAt: string;
}

export default function VettingDetailPage() {
  const params = useParams();
  const [vetting, setVetting] = useState<VettingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/vettings/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setVetting(data.vetting || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-warm">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full" />
        </div>
      </div>
    );
  }

  if (!vetting) {
    return (
      <div className="min-h-screen bg-bg-warm">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-text-muted font-medium">Vetting record not found</p>
        </div>
      </div>
    );
  }

  const overallScore = vetting.overallScore ?? (vetting.results.length > 0
    ? Math.round((vetting.results.reduce((s, r) => s + r.score, 0) / vetting.results.length) * 100) / 100
    : 0);

  return (
    <div className="min-h-screen bg-bg-warm">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10 pt-20 sm:pt-28">
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary-dark mb-6 transition-colors"
        >
          ← Back to history
        </Link>

        <div className="bg-white border border-border-warm rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-dark">{vetting.candidateName}</h1>
              <p className="text-text-muted text-sm mt-1">
                Vetted on {new Date(vetting.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              vetting.overallVerdict === "verified" ? "bg-emerald-100 text-emerald-700" :
              vetting.overallVerdict === "needs_review" ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>
              {vetting.overallVerdict.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-text-muted">NIN</p>
              <p className="font-medium text-primary-dark font-mono">•••••••••{vetting.nin.slice(-3)}</p>
            </div>
            <div>
              <p className="text-text-muted">Phone</p>
              <p className="font-medium text-primary-dark">{vetting.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-text-muted">Email</p>
              <p className="font-medium text-primary-dark">{vetting.email}</p>
            </div>
            {vetting.stateOfOrigin && (
              <div>
                <p className="text-text-muted">State of Origin</p>
                <p className="font-medium text-primary-dark">{vetting.stateOfOrigin}</p>
              </div>
            )}
            {vetting.bvn && (
              <div>
                <p className="text-text-muted">BVN</p>
                <p className="font-medium text-primary-dark font-mono">•••••••••{vetting.bvn.slice(-3)}</p>
              </div>
            )}
          </div>
        </div>

        <VettingResult
          results={vetting.results}
          overallVerdict={vetting.overallVerdict}
          overallScore={overallScore}
        />
      </main>
    </div>
  );
}