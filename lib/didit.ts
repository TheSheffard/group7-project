const DIDIT_BASE = "https://verification.didit.me/v3";

export interface DiditSession {
  sessionId: string;
  url: string;
  status: string;
}

/**
 * Create a Didit verification session (hosted flow).
 * The candidate opens session.url, presents their NIN document,
 * does a liveness check and a face match.
 *
 * FREE TIER: ID Verification + Liveness + Face Match (500/month).
 * NIN database cross-check (nga_national_id) is a PAID add-on ($0.08/query).
 *
 * Returns null when Didit is not configured -> the app falls back to
 * demo mode (simulated candidate page).
 */
export async function createDiditSession(opts: {
  workflowId?: string;
  vendorData: Record<string, string>;
  callbackUrl?: string;
}): Promise<DiditSession | null> {
  const apiKey = process.env.DIDIT_API_KEY;
  const workflowId = opts.workflowId || process.env.DIDIT_WORKFLOW_ID;
  if (!apiKey || !workflowId) {
    console.warn("Didit not configured (missing DIDIT_API_KEY / DIDIT_WORKFLOW_ID) - demo mode");
    return null;
  }

  try {
    const res = await fetch(`${DIDIT_BASE}/session/`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: JSON.stringify(opts.vendorData),
        callback: opts.callbackUrl,
      }),
    });

    if (!res.ok) {
      console.warn("Didit create session error:", res.status);
      return null;
    }

    const data = await res.json();
    console.log("Didit session created:", JSON.stringify(data, null, 2));

    return {
      sessionId: data.id || data.session_id || "",
      url: data.url || data.session_url || "",
      status: data.status || "created",
    };
  } catch (err) {
    console.warn("Didit create session failed:", err);
    return null;
  }
}

/**
 * Fetch the verification decision for a session.
 * Returns the Didit status string (e.g. "Approved", "Declined", "In Review", "Abandoned").
 */
export async function getDiditDecision(sessionId: string): Promise<string | null> {
  const apiKey = process.env.DIDIT_API_KEY;
  if (!apiKey || !sessionId) return null;

  try {
    const res = await fetch(`${DIDIT_BASE}/session/${sessionId}/decision/`, {
      headers: { "x-api-key": apiKey },
    });

    if (!res.ok) {
      console.warn("Didit decision error:", res.status);
      return null;
    }

    const data = await res.json();
    console.log("Didit decision:", JSON.stringify(data, null, 2));

    // Common shapes: { status } | { verification: { status } }
    const raw =
      (data?.verification && data.verification.status) ||
      data?.status ||
      data?.decision?.status ||
      "";
    return String(raw);
  } catch (err) {
    console.warn("Didit decision failed:", err);
    return null;
  }
}

/** Map a Didit status string to our verification status. */
export function mapDiditStatus(status: string): "verified" | "failed" | "pending" {
  const s = status.toLowerCase();
  if (s.includes("approve")) return "verified";
  if (s.includes("decline")) return "failed";
  return "pending";
}
