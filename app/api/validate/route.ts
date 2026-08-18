import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Vetting } from "@/lib/models/Vetting";
import { runValidation } from "@/lib/validators";
import { validatePhone } from "@/lib/validators/phone";
import { createDiditSession } from "@/lib/didit";

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
    const { candidateName, nin, phone, email, stateOfOrigin, bvn, ninCardPhoto } = body;

    // NIN is the unique identity key for a person — normalize it once
    const cleanNin = (nin || "").replace(/\s/g, "");

    // ---------- Strict input validation (throws clear 400 errors) ----------
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
      return NextResponse.json({ error: `Invalid phone number — ${phoneCheck.reason}` }, { status: 400 });
    }
    if (!nin) {
      return NextResponse.json({ error: "NIN is required" }, { status: 400 });
    }
    if (!NIN_REGEX.test(cleanNin)) {
      return NextResponse.json({ error: "Invalid NIN — must be exactly 11 digits" }, { status: 400 });
    }
    if (bvn && bvn.trim() && !BVN_REGEX.test(bvn.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Invalid BVN — must be exactly 11 digits" }, { status: 400 });
    }

    // ---------- Idempotency ----------
    // Client sends an Idempotency-Key header (or body.idempotencyKey).
    // If the same key is seen again, return the stored result instead of
    // creating a duplicate vetting record.
    const idempotencyKey =
      req.headers.get("idempotency-key") || body.idempotencyKey || randomUUID();

    await connectDB();

    const existing = await Vetting.findOne({
      userId: session.userId,
      idempotencyKey,
    }).lean();

    const origin = process.env.APP_URL || "http://localhost:3000";

    if (existing) {
      console.log(`Idempotency hit for key ${idempotencyKey} — returning existing vetting ${existing._id}`);
      return NextResponse.json({
        id: existing._id,
        duplicate: true,
        verificationStatus: existing.verificationStatus,
        verificationLink: `${origin}/verify/${existing.verifyToken}`,
        diditUrl: existing.diditUrl || null,
        results: existing.results,
        overallVerdict: existing.overallVerdict,
        overallScore: Math.round(
          ((existing.results as { score: number }[]).reduce((s, r) => s + r.score, 0) /
            (existing.results as { score: number }[]).length) * 100
        ) / 100,
      });
    }

    // ---------- NIN uniqueness (no duplicate vetting of the same person) ----------
    // NIN is unique per person — a candidate must not be vetted twice by this account.
    const alreadyVetted = await Vetting.findOne({
      userId: session.userId,
      nin: cleanNin,
    }).lean();

    if (alreadyVetted) {
      console.log(`Duplicate NIN rejected: ${cleanNin} already vetted as ${alreadyVetted._id}`);
      return NextResponse.json(
        {
          error: `This NIN (${cleanNin}) has already been vetted in your account. Duplicate submissions are not allowed.`,
          duplicateNin: true,
          existingVettingId: alreadyVetted._id,
        },
        { status: 409 }
      );
    }

    // ---------- Run the synchronous component checks ----------
    const result = await runValidation({
      email,
      phone,
      nin: cleanNin,
      candidateName,
      stateOfOrigin,
      bvn,
    });

    // ---------- Save ONLY if there is not a single failed check ----------
    // If any component reports an error, we show the results on screen but
    // do NOT persist the vetting to the database.
    const hasErrors = result.results.some((r) => !r.valid);
    if (hasErrors) {
      return NextResponse.json({
        saved: false,
        error: "This candidate failed one or more checks — the record was NOT saved to history.",
        results: result.results,
        overallVerdict: result.overallVerdict,
        overallScore: result.overallScore,
      });
    }

    // ---------- Create the identity verification link + Didit session ----------
    const verifyToken = randomUUID();
    const callbackUrl = `${origin}/api/webhooks/didit`;

    const didit = await createDiditSession({
      vendorData: { candidateName, nin: cleanNin, phone, email },
      callbackUrl,
    });

    // ---------- Save the vetting record ----------
    const vetting = await Vetting.create({
      userId: session.userId,
      candidateName: candidateName.trim(),
      nin: cleanNin,
      phone,
      email,
      stateOfOrigin,
      bvn,
      ninCardPhoto: ninCardPhoto || undefined,
      results: result.results,
      overallVerdict: result.overallVerdict,
      verificationStatus: "awaiting_candidate",
      diditSessionId: didit?.sessionId || undefined,
      diditUrl: didit?.url || undefined,
      verifyToken,
      idempotencyKey,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    return NextResponse.json({
      id: vetting._id,
      verifyToken,
      verificationStatus: "awaiting_candidate",
      verificationLink: `${origin}/verify/${verifyToken}`,
      diditUrl: didit?.url || null,
      results: result.results,
      overallVerdict: result.overallVerdict,
      overallScore: result.overallScore,
    });
  } catch (err) {
    console.error("Validation error:", err);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}