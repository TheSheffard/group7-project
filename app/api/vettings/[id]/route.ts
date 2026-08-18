import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Vetting } from "@/lib/models/Vetting";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const vetting = await Vetting.findOne({
      _id: id,
      userId: session.userId,
    }).lean();

    if (!vetting) {
      return NextResponse.json({ error: "Vetting not found" }, { status: 404 });
    }

    return NextResponse.json({ vetting });
  } catch (err) {
    console.error("Fetch vetting error:", err);
    return NextResponse.json({ error: "Failed to fetch vetting" }, { status: 500 });
  }
}