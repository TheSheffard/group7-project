"use client";

import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ShieldCheck,
    Info,
    CircleCheck,
    CircleX,
    Mail,
    Phone,
    IdCard,
    Building2,
    Key,
} from "lucide-react";

interface ResultItem {
    component: string;
    valid: boolean;
    reason: string;
    score: number;
    details?: Record<string, unknown>;
}

interface VettingResultProps {
    results: ResultItem[];
    overallVerdict: "verified" | "needs_review" | "failed";
    overallScore: number;
}

const STATUS_CONFIG = {
    verified: {
        border: "border-emerald-200",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: CheckCircle2,
        label: "Verified",
        desc: "All checks passed successfully",
    },
    needs_review: {
        border: "border-amber-200",
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: AlertTriangle,
        label: "Needs Review",
        desc: "Some checks require manual attention",
    },
    failed: {
        border: "border-rose-200",
        bg: "bg-rose-50",
        text: "text-rose-700",
        icon: XCircle,
        label: "Failed",
        desc: "Critical checks did not pass",
    },
};

const COMPONENT_LABELS: Record<string, string> = {
    email: "Email Address",
    phone: "Phone Number",
    nin: "NIN (National ID)",
    bvn: "BVN",
    password: "Password",
};

const COMPONENT_ICONS: Record<string, React.ReactNode> = {
    email: <Mail className="h-5 w-5 text-slate-500" />,
    phone: <Phone className="h-5 w-5 text-slate-500" />,
    nin: <IdCard className="h-5 w-5 text-slate-500" />,
    bvn: <Building2 className="h-5 w-5 text-slate-500" />,
    password: <Key className="h-5 w-5 text-slate-500" />,
};

export default function VettingResult({
    results,
    overallVerdict,
    overallScore,
}: VettingResultProps) {
    const cfg = STATUS_CONFIG[overallVerdict];
    const StatusIcon = cfg.icon;
    const scorePercent = Math.round(overallScore * 100);

    // Circular progress for each component
    const CircleProgress = ({ value }: { value: number }) => {
        const percentage = Math.round(value * 100);
        const circumference = 2 * Math.PI * 18; // radius 18
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        const color =
            percentage >= 80 ? "stroke-emerald-500" :
            percentage >= 50 ? "stroke-amber-500" :
            "stroke-rose-500";

        return (
            <div className="relative h-10 w-10 shrink-0">
                <svg className="h-10 w-10 -rotate-90 transform">
                    <circle
                        className="stroke-slate-200"
                        strokeWidth="3"
                        fill="none"
                        r="18"
                        cx="20"
                        cy="20"
                    />
                    <circle
                        className={`${color} transition-all duration-700 ease-out`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        r="18"
                        cx="20"
                        cy="20"
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset,
                        }}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-slate-600">
                    {percentage}%
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Overall verdict banner — clean card */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${cfg.bg}`}>
                            <StatusIcon className={`h-6 w-6 ${cfg.text}`} strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                Overall Verdict
                            </p>
                            <h3 className={`text-xl font-bold ${cfg.text}`}>
                                {cfg.label}
                            </h3>
                            <p className="text-sm text-slate-500">{cfg.desc}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                Confidence Score
                            </p>
                            <p className={`text-2xl font-bold ${cfg.text}`}>
                                {scorePercent}%
                            </p>
                        </div>
                        <div className="h-12 w-12 shrink-0">
                            <CircleProgress value={overallScore} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Component checks — list style */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Component Checks
                    </h4>
                    <span className="ml-auto text-xs text-slate-400">
                        {results.filter((r) => r.valid).length} / {results.length} passed
                    </span>
                </div>

                <div className="space-y-3">
                    {results.map((r, idx) => {
                        const label = COMPONENT_LABELS[r.component] || r.component;
                        const icon = COMPONENT_ICONS[r.component] || null;
                        const pass = r.valid;

                        return (
                            <div
                                key={idx}
                                className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                                    pass
                                        ? "border-emerald-200/80 bg-white"
                                        : "border-rose-200/80 bg-white"
                                }`}
                            >
                                {/* Icon */}
                                <div className="mt-0.5">{icon}</div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-slate-800">{label}</p>
                                        <span
                                            className={`ml-auto text-xs font-medium ${
                                                pass ? "text-emerald-600" : "text-rose-600"
                                            }`}
                                        >
                                            {pass ? "Pass" : "Fail"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">{r.reason}</p>

                                    {/* Score bar with label */}
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${
                                                    r.score >= 0.7
                                                        ? "bg-emerald-500"
                                                        : r.score >= 0.4
                                                          ? "bg-amber-500"
                                                          : "bg-rose-500"
                                                }`}
                                                style={{ width: `${Math.round(r.score * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 tabular-nums">
                                            {Math.round(r.score * 100)}%
                                        </span>
                                    </div>

                                    {/* Details tags */}
                                    {r.details && Object.keys(r.details).length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {Object.entries(r.details).map(([k, v]) => (
                                                <span
                                                    key={k}
                                                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600"
                                                >
                                                    <Info className="h-2.5 w-2.5" />
                                                    {k}: {String(v).slice(0, 20)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Status icon */}
                                <div className="mt-1 shrink-0">
                                    {pass ? (
                                        <CircleCheck className="h-5 w-5 text-emerald-500" />
                                    ) : (
                                        <CircleX className="h-5 w-5 text-rose-500" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}