import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

export async function GET() {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { name: "asc" },
      select: { 
        sponsorId: true, 
        name: true, 
        logoUrl: true, 
        website: true 
      },
    });
    return NextResponse.json({ success: true, data: sponsors });
  } catch (error) {
    console.error("Get Sponsors API Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch sponsors." }, { status: 500 });
  }
}