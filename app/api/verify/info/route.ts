import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Vetting } from "@/lib/models/Vetting";
import { getDiditDecision, mapDiditStatus } from "@/lib/didit";

/**
 * Public endpoint — the candidate opens this via their verification link.
 * Looks up a vetting by its verifyToken and returns what the candidate
 * needs to see (no sensitive data).
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
    }

    await connectDB();
    const vetting = await Vetting.findOne({ verifyToken: token }).lean();

    if (!vetting) {
      return NextResponse.json({ valid: false, error: "Verification link not found" }, { status: 404 });
    }

    // Expiry check
    if (vetting.expiresAt && new Date(vetting.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "This verification link has expired" }, { status: 410 });
    }

    // If waiting on a Didit session, try to refresh from Didit
    let status = vetting.verificationStatus;
    if (vetting.verificationStatus === "awaiting_candidate" && vetting.diditSessionId) {
      const decision = await getDiditDecision(vetting.diditSessionId);
      if (decision) {
        const mapped = mapDiditStatus(decision);
        if (mapped !== "pending") {
          status = mapped;
          await Vetting.updateOne(
            { _id: vetting._id },
            { $set: { verificationStatus: mapped } }
          );
        }
      }
    }

    return NextResponse.json({
      valid: true,
      candidateName: vetting.candidateName,
      verificationStatus: status,
      diditSessionId: vetting.diditSessionId || undefined,
      diditUrl: vetting.diditUrl || undefined,
      expiresAt: vetting.expiresAt?.toISOString(),
    });
  } catch (err) {
    console.error("Verify info error:", err);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}