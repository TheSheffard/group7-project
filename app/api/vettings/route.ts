import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Vetting } from "@/lib/models/Vetting";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const vettings = await Vetting.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .select("-results")
      .lean();

    return NextResponse.json({ vettings });
  } catch (err) {
    console.error("Fetch vettings error:", err);
    return NextResponse.json({ error: "Failed to fetch vettings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const {
      candidateName, nin, phone, email, stateOfOrigin, bvn,
      results, overallVerdict, idempotencyKey,
    } = body;

    if (!candidateName || !nin || !phone || !email) {
      return NextResponse.json(
        { error: "candidateName, nin, phone, and email are required" },
        { status: 400 }
      );
    }

    const cleanNin = (nin || "").replace(/\s/g, "");
    if (!/^\d{11}$/.test(cleanNin)) {
      return NextResponse.json({ error: "Invalid NIN - must be exactly 11 digits" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const key = idempotencyKey || randomUUID();
    const existing = await Vetting.findOne({ userId: session.userId, idempotencyKey: key }).lean();
    if (existing) {
      return NextResponse.json({ vetting: existing, duplicate: true }, { status: 200 });
    }

    const alreadyVetted = await Vetting.findOne({ userId: session.userId, nin: cleanNin }).lean();
    if (alreadyVetted) {
      return NextResponse.json(
        { error: `This NIN (${cleanNin}) has already been vetted in your account. Duplicate submissions are not allowed.` },
        { status: 409 }
      );
    }

    let finalResults = results;
    let finalVerdict = overallVerdict;
    if (!finalResults) {
      const { runValidation } = await import("@/lib/validators");
      const result = await runValidation({ email, phone, nin: cleanNin, candidateName, stateOfOrigin, bvn });
      finalResults = result.results;
      finalVerdict = result.overallVerdict;
    }

    const vetting = await Vetting.create({
      userId: session.userId,
      candidateName,
      nin: cleanNin,
      phone, email, stateOfOrigin, bvn,
      idempotencyKey: key,
      results: finalResults,
      overallVerdict: finalVerdict,
    });

    return NextResponse.json({ vetting }, { status: 201 });
  } catch (err) {
    console.error("Create vetting error:", err);
    return NextResponse.json({ error: "Failed to create vetting" }, { status: 500 });
  }
}