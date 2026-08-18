// HistoryTable.tsx
"use client";

import Link from "next/link";
import {
    Calendar,
    User,
    IdCard,
    ShieldCheck,
    AlertTriangle,
    XCircle,
    ArrowRight,
    Eye,
} from "lucide-react";

interface VettingRecord {
    _id: string;
    candidateName: string;
    nin: string;
    overallVerdict: "verified" | "needs_review" | "failed";
    createdAt: string;
}

interface HistoryTableProps {
    vettings: VettingRecord[];
}

const BADGE_CONFIG = {
    verified: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: ShieldCheck,
        label: "Verified",
    },
    needs_review: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        icon: AlertTriangle,
        label: "Needs Review",
    },
    failed: {
        bg: "bg-rose-100",
        text: "text-rose-700",
        icon: XCircle,
        label: "Failed",
    },
};

export default function HistoryTable({ vettings }: HistoryTableProps) {
    if (vettings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <IdCard className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-700">No vettings yet</h3>
                <p className="mt-1 text-sm text-slate-500">
                    Head over to the dashboard to vet your first candidate.
                </p>
                <Link
                    href="/"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                            <th className="px-5 py-3.5 font-semibold text-slate-600">
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date
                                </span>
                            </th>
                            <th className="px-5 py-3.5 font-semibold text-slate-600">
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Candidate
                                </span>
                            </th>
                            <th className="px-5 py-3.5 font-semibold text-slate-600">
                                <span className="flex items-center gap-2">
                                    <IdCard className="h-4 w-4" />
                                    NIN
                                </span>
                            </th>
                            <th className="px-5 py-3.5 font-semibold text-slate-600">Verdict</th>
                            <th className="px-5 py-3.5 text-right font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {vettings.map((v) => {
                            const badge = BADGE_CONFIG[v.overallVerdict];
                            const BadgeIcon = badge.icon;
                            return (
                                <tr
                                    key={v._id}
                                    className="transition-colors hover:bg-slate-50/80"
                                >
                                    <td className="px-5 py-4 text-slate-500">
                                        {new Date(v.createdAt).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="px-5 py-4 font-medium text-slate-800">
                                        {v.candidateName}
                                    </td>
                                    <td className="px-5 py-4 font-mono text-slate-500">
                                        •••••{v.nin.slice(-4)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}
                                        >
                                            <BadgeIcon className="h-3.5 w-3.5" />
                                            {badge.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/history/${v._id}`}
                                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile card list */}
            <div className="divide-y divide-slate-100 md:hidden">
                {vettings.map((v) => {
                    const badge = BADGE_CONFIG[v.overallVerdict];
                    const BadgeIcon = badge.icon;
                    return (
                        <div key={v._id} className="px-4 py-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="font-semibold text-slate-800">{v.candidateName}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(v.createdAt).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <span className="font-mono">•••••{v.nin.slice(-4)}</span>
                                    </div>
                                </div>
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}
                                >
                                    <BadgeIcon className="h-3.5 w-3.5" />
                                    {badge.label}
                                </span>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <Link
                                    href={`/history/${v._id}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                                >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}