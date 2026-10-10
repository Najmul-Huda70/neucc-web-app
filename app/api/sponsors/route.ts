// app/api/sponsors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";
import { getAdminSponsors } from "@/lib/services/sponsors";
import { uploadImage } from "@/lib/cloudinary";

// GET: Fetch all sponsors (Admin/Moderator authorized)
export async function GET() {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status }
    );
  }

  try {
    const sponsors = await getAdminSponsors();
    return NextResponse.json({ success: true, data: sponsors });
  } catch (error) {
    console.error("Get Sponsors API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sponsors." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const { name, logoUrl, website } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Company name is required." },
        { status: 400 }
      );
    }

    // ডুপ্লিকেট চেক
    const existingSponsor = await prisma.sponsor.findFirst({
      where: { name: { equals: name.trim(), mode: "insensitive" } },
    });

    if (existingSponsor) {
      return NextResponse.json(
        { success: false, message: "A sponsor with this name already exists." },
        { status: 400 }
      );
    }

    let finalLogoUrl = null;

    // যদি নতুন লোগো দেওয়া হয় (Base64 বা URL)
    if (logoUrl) {
      if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
        finalLogoUrl = logoUrl;
      } else {
        // lib/cloudinary.ts এর uploadImage ফাংশন কল করা হলো
        finalLogoUrl = await uploadImage(logoUrl, "neucc/sponsors");
      }
    }

    const newSponsor = await prisma.sponsor.create({
      data: {
        name: name.trim(),
        logoUrl: finalLogoUrl,
        website: website || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sponsor added successfully.",
        data: newSponsor,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating sponsor:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error." },
      { status: 500 }
    );
  }
}