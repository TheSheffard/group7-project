"use client";

import Link from "next/link";

interface VettingRecord {
  _id: string;
  candidateName: string;
  nin: string;
  overallVerdict: "verified" | "needs_review" | "failed";
  verificationStatus?: "pending" | "awaiting_candidate" | "verified" | "failed";
  createdAt: string;
}

interface HistoryTableProps {
  vettings: VettingRecord[];
}

const BADGES = {
  verified: "bg-emerald-100 text-emerald-700",
  needs_review: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-bg-warm text-text-muted",
  awaiting_candidate: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  awaiting_candidate: "Awaiting candidate",
  verified: "Identity verified",
  failed: "Identity failed",
};

export default function HistoryTable({ vettings }: HistoryTableProps) {
  if (vettings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-text-muted font-medium">No vettings yet</p>
        <p className="text-sm text-text-muted/70 mt-1">
          Head over to the dashboard to vet your first candidate.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-warm bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-warm text-primary-dark text-left">
            <th className="px-5 py-3 font-semibold">Date</th>
            <th className="px-5 py-3 font-semibold">Candidate</th>
            <th className="px-5 py-3 font-semibold">NIN</th>
            <th className="px-5 py-3 font-semibold">Verdict</th>
            <th className="px-5 py-3 font-semibold">Verification</th>
            <th className="px-5 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-warm">
          {vettings.map((v) => (
            <tr key={v._id} className="hover:bg-bg-warm/50 transition-colors">
              <td className="px-5 py-4 text-text-muted">
                {new Date(v.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-5 py-4 font-medium text-primary-dark">{v.candidateName}</td>
              <td className="px-5 py-4 text-text-muted font-mono">
                •••••{v.nin.slice(-4)}
              </td>
              <td className="px-5 py-4">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    BADGES[v.overallVerdict]
                  }`}
                >
                  {v.overallVerdict.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </td>
              <td className="px-5 py-4">
                {v.verificationStatus ? (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      STATUS_BADGES[v.verificationStatus]
                    }`}
                  >
                    {STATUS_LABELS[v.verificationStatus]}
                  </span>
                ) : (
                  <span className="text-xs text-text-muted">—</span>
                )}
              </td>
              <td className="px-5 py-4 text-right">
                <Link
                  href={`/history/${v._id}`}
                  className="text-primary-light hover:text-primary text-sm font-medium transition-colors"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}