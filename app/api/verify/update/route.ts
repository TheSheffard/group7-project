import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Vetting } from "@/lib/models/Vetting";

/**
 * Simulation endpoint (demo mode only).
 * When Didit is not configured, the demo candidate page calls this
 * to simulate a successful/failed face match.
 */
export async function POST(req: Request) {
  try {
    const { token, outcome } = await req.json();

    if (!token || !["verified", "failed"].includes(outcome)) {
      return NextResponse.json({ error: "token and outcome are required" }, { status: 400 });
    }

    await connectDB();
    const vetting = await Vetting.findOneAndUpdate(
      { verifyToken: token, verificationStatus: "awaiting_candidate" },
      { $set: { verificationStatus: outcome } },
      { new: true }
    ).lean();

    if (!vetting) {
      return NextResponse.json(
        { error: "Verification link not found or already completed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ verificationStatus: vetting.verificationStatus });
  } catch (err) {
    console.error("Verify update error:", err);
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 });
  }
}