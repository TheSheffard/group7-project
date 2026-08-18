import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Vetting } from "@/lib/models/Vetting";
import { getDiditDecision, mapDiditStatus } from "@/lib/didit";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    await connectDB();
    const vetting = await Vetting.findOne({ _id: id, userId: session.userId }).lean();

    if (!vetting) {
      return NextResponse.json({ error: "Vetting not found" }, { status: 404 });
    }

    let status = vetting.verificationStatus;

    // If waiting on a Didit session, ask Didit for the decision
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
      id: vetting._id,
      verificationStatus: status,
      overallVerdict: vetting.overallVerdict,
    });
  } catch (err) {
    console.error("Verify status error:", err);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}