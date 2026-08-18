import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Vetting } from "@/lib/models/Vetting";
import { runValidation } from "@/lib/validators";
import { validatePhone } from "@/lib/validators/phone";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIN_REGEX = /^\d{11}$/;
const BVN_REGEX = /^\d{11}$/;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { candidateName, nin, phone, email, stateOfOrigin, bvn } = body;
    const cleanNin = (nin || "").replace(/\s/g, "");

    // ---------- Strict input validation ----------
    if (!candidateName || !candidateName.trim()) {
      return NextResponse.json({ error: "Candidate full name is required" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: `Invalid email address: "${email}"` }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    const phoneCheck = await validatePhone(phone);
    if (!phoneCheck.valid) {
      return NextResponse.json({ error: `Invalid phone number - ${phoneCheck.reason}` }, { status: 400 });
    }
    if (!nin) {
      return NextResponse.json({ error: "NIN is required" }, { status: 400 });
    }
    if (!NIN_REGEX.test(cleanNin)) {
      return NextResponse.json({ error: "Invalid NIN - must be exactly 11 digits" }, { status: 400 });
    }
    if (bvn && bvn.trim() && !BVN_REGEX.test(bvn.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Invalid BVN - must be exactly 11 digits" }, { status: 400 });
    }

    // ---------- Idempotency ----------
    const idempotencyKey = req.headers.get("idempotency-key") || body.idempotencyKey || randomUUID();
    await connectDB();

    const existing = await Vetting.findOne({ userId: session.userId, idempotencyKey }).lean();
    if (existing) {
      console.log(`Idempotency hit for key ${idempotencyKey}`);
      return NextResponse.json({
        id: existing._id,
        duplicate: true,
        results: existing.results,
        overallVerdict: existing.overallVerdict,
        overallScore: Math.round(
          ((existing.results as { score: number }[]).reduce((s, r) => s + r.score, 0) /
            (existing.results as { score: number }[]).length) * 100
        ) / 100,
      });
    }

    // ---------- NIN uniqueness ----------
    const alreadyVetted = await Vetting.findOne({ userId: session.userId, nin: cleanNin }).lean();
    if (alreadyVetted) {
      return NextResponse.json(
        {
          error: `This NIN (${cleanNin}) has already been vetted in your account. Duplicate submissions are not allowed.`,
          duplicateNin: true,
        },
        { status: 409 }
      );
    }

    // ---------- Run all component validators ----------
    const result = await runValidation({
      email, phone, nin: cleanNin, candidateName, stateOfOrigin, bvn,
    });

    // ---------- Save ONLY when there is not a single failed check ----------
    const hasErrors = result.results.some((r) => !r.valid);
    if (hasErrors) {
      return NextResponse.json({
        saved: false,
        error: "This candidate failed one or more checks - the record was NOT saved to history.",
        results: result.results,
        overallVerdict: result.overallVerdict,
        overallScore: result.overallScore,
      });
    }

    // ---------- Save the vetting record ----------
    const vetting = await Vetting.create({
      userId: session.userId,
      candidateName: candidateName.trim(),
      nin: cleanNin,
      phone, email, stateOfOrigin, bvn,
      results: result.results,
      overallVerdict: result.overallVerdict,
      idempotencyKey,
    });

    return NextResponse.json({
      id: vetting._id,
      results: result.results,
      overallVerdict: result.overallVerdict,
      overallScore: result.overallScore,
    });
  } catch (err) {
    console.error("Validation error:", err);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}