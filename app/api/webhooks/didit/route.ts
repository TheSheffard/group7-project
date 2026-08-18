import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Vetting } from "@/lib/models/Vetting";
import { mapDiditStatus } from "@/lib/didit";

/**
 * Didit webhook receiver.
 * Didit POSTs here when a verification session finishes.
 * We update the matching vetting record's status.
 */
export async function POST(req: Request) {
  try {
    const raw = await req.text();
    console.log("Didit webhook received:", raw.slice(0, 2000));

    let body: any = null;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    // Find the session id from the webhook payload (common shapes)
    const sessionId =
      body?.session?.id ||
      body?.session_id ||
      body?.data?.session_id ||
      body?.id ||
      "";

    const statusRaw =
      body?.verification?.status ||
      body?.session?.status ||
      body?.status ||
      "";

    if (!sessionId && !statusRaw) {
      return NextResponse.json({ ok: true }); // ignore unknown payloads
    }

    const mapped = statusRaw ? mapDiditStatus(String(statusRaw)) : null;

    if (mapped && mapped !== "pending") {
      await connectDB();
      const updated = await Vetting.findOneAndUpdate(
        { diditSessionId: sessionId },
        { $set: { verificationStatus: mapped } },
        { new: true }
      ).lean();
      if (updated) {
        console.log(`Webhook updated vetting ${updated._id} -> ${mapped}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Didit webhook error:", err);
    return NextResponse.json({ ok: false, error: "Webhook handler error" }, { status: 500 });
  }
}