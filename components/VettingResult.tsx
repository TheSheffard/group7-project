"use client";

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
  verified: { bg: "bg-emerald-50 border-emerald-300", text: "text-emerald-800", icon: "✅", label: "Verified" },
  needs_review: { bg: "bg-amber-50 border-amber-300", text: "text-amber-800", icon: "⚠️", label: "Needs Review" },
  failed: { bg: "bg-red-50 border-red-300", text: "text-red-800", icon: "❌", label: "Failed" },
};

const COMPONENT_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone Number",
  nin: "NIN (National ID)",
  bvn: "BVN",
  password: "Password",
};

export default function VettingResult({ results, overallVerdict, overallScore }: VettingResultProps) {
  const cfg = STATUS_CONFIG[overallVerdict];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overall verdict banner */}
      <div className={`border-2 rounded-xl p-5 ${cfg.bg}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-muted mb-1">Overall Verdict</p>
            <h3 className={`text-2xl font-bold ${cfg.text}`}>
              {cfg.icon} {cfg.label}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-muted mb-1">Confidence Score</p>
            <p className={`text-2xl font-bold ${cfg.text}`}>
              {Math.round(overallScore * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Per-component results */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-primary-dark uppercase tracking-wider">
          Component Checks
        </h4>
        {results.map((r, idx) => (
          <div
            key={idx}
            className="bg-white border border-border-warm rounded-xl p-4 flex items-start gap-4"
          >
            <span className="text-xl mt-0.5">{r.valid ? "✅" : "❌"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-primary-dark">
                  {COMPONENT_LABELS[r.component] || r.component}
                </p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    r.valid
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {r.valid ? "PASS" : "FAIL"}
                </span>
              </div>
              <p className="text-sm text-text-muted mt-0.5">{r.reason}</p>
              {r.details && Object.keys(r.details).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(r.details).map(([k, v]) => (
                    <span
                      key={k}
                      className="text-xs bg-bg-warm text-text-muted px-2 py-1 rounded-md"
                    >
                      {k}: {String(v)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}