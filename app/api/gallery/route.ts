import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

// GET: Public & Admin Gallery Fetch
export async function GET() {
  try {
    const auth = await verifyRole(["ADMIN", "MODERATOR"]).catch(() => null);
    const isAdmin = auth?.isAuthorized ?? false;

    const images = await prisma.gallery.findMany({
      where: isAdmin ? {} : { isPublic: true,isHero:false },
      orderBy: { createdAt: "desc" },
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
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch gallery images." },
      { status: 500 }
    );
  }
}

// POST: Add New Image (Admin / Moderator)
export async function POST(req: Request) {
  try {
    const auth = await verifyRole(["ADMIN", "MODERATOR"]);
    if (!auth || !auth.isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { imageUrl, caption, location, date, isHero, isPublic, eventId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: "Image URL or source is required" },
        { status: 400 }
      );
    }

    const newGalleryItem = await prisma.gallery.create({
      data: {
        imageUrl,
        caption,
        location,
        date: date ? new Date(date) : null,
        isHero: Boolean(isHero),
        isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
        eventId: eventId || null,
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

    return NextResponse.json({ success: true, data: newGalleryItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save new image." },
      { status: 500 }
    );
  }
}