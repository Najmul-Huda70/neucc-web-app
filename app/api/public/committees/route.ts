import { NextResponse } from "next/server";
import { getPublicCommittees } from "@/lib/services/committees";

export async function GET() {
  const committees = await getPublicCommittees();
  return NextResponse.json({ success: true, data: committees });
}