// HistoryPage.tsx
"use client";

import { useEffect, useState } from "react";
import {
    History,
    Clock,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import HistoryTable from "@/components/HistoryTable";

interface VettingRecord {
    _id: string;
    candidateName: string;
    nin: string;
    overallVerdict: "verified" | "needs_review" | "failed";
    createdAt: string;
}

export default function HistoryPage() {
    const [vettings, setVettings] = useState<VettingRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/vettings")
            .then((r) => r.json())
            .then((data) => {
                setVettings(data.vettings || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Calculate summary stats
    const total = vettings.length;
    const verified = vettings.filter((v) => v.overallVerdict === "verified").length;
    const needsReview = vettings.filter((v) => v.overallVerdict === "needs_review").length;
    const failed = vettings.filter((v) => v.overallVerdict === "failed").length;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 py-18 sm:pt-26">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800 sm:text-3xl">
                        <History className="h-7 w-7 text-emerald-500" />
                        Vetting History
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        All your past vettings, sorted by date.
                    </p>
                </div>

                {/* Summary Stats */}
                {!loading && vettings.length > 0 && (
                    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                Total
                            </p>
                            <p className="text-xl font-bold text-slate-700">{total}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 shadow-sm">
                            <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Verified
                            </p>
                            <p className="text-xl font-bold text-emerald-700">{verified}</p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 shadow-sm">
                            <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-amber-600">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Needs Review
                            </p>
                            <p className="text-xl font-bold text-amber-700">{needsReview}</p>
                        </div>
                        <div className="rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 shadow-sm">
                            <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-rose-600">
                                <XCircle className="h-3.5 w-3.5" />
                                Failed
                            </p>
                            <p className="text-xl font-bold text-rose-700">{failed}</p>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 pt-28 shadow-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        <p className="mt-3 text-sm text-slate-500">Loading history…</p>
                    </div>
                ) : (
                    <HistoryTable vettings={vettings} />
                )}
            </main>
        </div>
    );
}