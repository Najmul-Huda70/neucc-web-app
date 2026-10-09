import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

// PATCH: Update Image Details & Image URL
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  try {
    const auth = await verifyRole(["ADMIN", "MODERATOR"]);
    if (!auth || !auth.isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Next.js 15: params unwrap with await
    const { galleryId } = await params;
    const body = await req.json();

    const { caption, location, date, isHero, isPublic, eventId, imageUrl } = body;

    const updated = await prisma.gallery.update({
      where: { galleryId },
      data: {
        caption,
        location,
        date: date ? new Date(date) : null,
        isHero: Boolean(isHero),
        isPublic: Boolean(isPublic),
        eventId: eventId || null,
        ...(imageUrl ? { imageUrl } : {}),
      },
      select: {
        galleryId: true,
        imageUrl: true,
        caption: true,
        location: true,
        date: true,
        isHero: true,
        isPublic: true,
        eventId: true,
        event: {
          select: { title: true, slug: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update image details." },
      { status: 500 }
    );
  }
}

// DELETE: Full Delete Image from Gallery
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  try {
    const auth = await verifyRole(["ADMIN", "MODERATOR"]);
    if (!auth || !auth.isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Next.js 15: params unwrap with await
    const { galleryId } = await params;

    await prisma.gallery.delete({
      where: { galleryId },
    });

    return NextResponse.json({ success: true, message: "Image deleted successfully." });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete image." },
      { status: 500 }
    );
  }
}