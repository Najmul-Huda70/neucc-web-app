import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";
import { getSponsorDetailsById } from "@/lib/services/sponsors";
import { deleteImage, extractPublicId, uploadImage } from "@/lib/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sponsorId: string }> }
) {
  // Admin ba moderator role verification
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status }
    );
  }

  try {
    const { sponsorId } = await params;

    const sponsor = await getSponsorDetailsById(sponsorId);

    if (!sponsor) {
      return NextResponse.json(
        { success: false, message: "Sponsor not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: sponsor }, { status: 200 });
  } catch (error) {
    console.error("Get Sponsor Details API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sponsor details." },
      { status: 500 }
    );
  }
}
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ sponsorId: string }> }
) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status }
    );
  }

  try {
    const { sponsorId } = await params;
    const body = await req.json();
    const { name, logoUrl, website } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Company name is required." },
        { status: 400 }
      );
    }

    // স্পন্সর বিদ্যমান আছে কি না চেক
    const sponsorToUpdate = await prisma.sponsor.findUnique({
      where: { sponsorId },
    });

    if (!sponsorToUpdate) {
      return NextResponse.json(
        { success: false, message: "Sponsor not found." },
        { status: 404 }
      );
    }

    // নামের কনফ্লিক্ট চেক
    const existingSponsor = await prisma.sponsor.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        NOT: { sponsorId },
      },
    });

    if (existingSponsor) {
      return NextResponse.json(
        { success: false, message: "A sponsor with this name already exists." },
        { status: 400 }
      );
    }

    let finalLogoUrl = sponsorToUpdate.logoUrl;

    // নতুন লোগো দেওয়া হলে প্রসেস করা
    if (logoUrl !== undefined) {
      if (!logoUrl) {
        // যদি লোগো রিমুভ করতে চায়
        if (sponsorToUpdate.logoUrl) {
          const publicId = extractPublicId(sponsorToUpdate.logoUrl);
          if (publicId) await deleteImage(publicId).catch(() => {});
        }
        finalLogoUrl = null;
      } else if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
        finalLogoUrl = logoUrl;
      } else {
        // পুরোনো লোগো ক্লাউডিনারি থেকে ডিলিট করে নতুন লোগো আপলোড করা
        if (sponsorToUpdate.logoUrl) {
          const oldPublicId = extractPublicId(sponsorToUpdate.logoUrl);
          if (oldPublicId) await deleteImage(oldPublicId).catch(() => {});
        }
        finalLogoUrl = await uploadImage(logoUrl, "neucc/sponsors");
      }
    }

    const updatedSponsor = await prisma.sponsor.update({
      where: { sponsorId },
      data: {
        name: name.trim(),
        logoUrl: finalLogoUrl,
        website: website || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sponsor updated successfully.",
        data: updatedSponsor,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating sponsor:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error." },
      { status: 500 }
    );
  }
}
// DELETE: Delete sponsor with strict validation against linked events
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ sponsorId: string }> }
) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status }
    );
  }

  try {
    const { sponsorId } = await params;

    // ১. Sponsor ebong tar associated events (EventSponsor er maddhome) khoja
    const sponsor = await prisma.sponsor.findUnique({
      where: { sponsorId },
      include: {
        eventSponsors: {
          include: {
            event: {
              select: {
                eventId: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!sponsor) {
      return NextResponse.json(
        { success: false, message: "Sponsor not found." },
        { status: 404 }
      );
    }

    // ২. Jodi company ti kono event-e sponsor kore thake, delete block kore event list pathabo
    if (sponsor.eventSponsors && sponsor.eventSponsors.length > 0) {
      const linkedEvents = sponsor.eventSponsors.map((es) => es.event.title);
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete company. It is currently linked with ${sponsor.eventSponsors.length} event(s).`,
          linkedEvents,
        },
        { status: 400 }
      );
    }

    // ৩. Kono event-e jukto na thakle safe-vabe delete kora
    await prisma.sponsor.delete({
      where: { sponsorId },
    });

    return NextResponse.json(
      { success: true, message: "Company deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Sponsor API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete company." },
      { status: 500 }
    );
  }
}

