import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

/**
 * 1. Public Gallery Images
 * - Admin/Moderator: isHero = false (isPublic true/false সব দেখবে)
 * - Public Visitor: isHero = false এবং isPublic = true
 */
export async function getPublicGalleryImages() {
  try {
    let isAdminOrModerator = false;

    // Safe Token Validation: কুকি না থাকলেও যাতে কোড এক্সিকিউশন না থামে
    try {
      const authResult = await verifyRole(["ADMIN", "MODERATOR"]);
      if (authResult && authResult.isAuthorized) {
        isAdminOrModerator = true;
      }
    } catch {
      isAdminOrModerator = false;
    }

    const images = await prisma.gallery.findMany({
      where: {
        isHero: false,
        ...(isAdminOrModerator ? {} : { isPublic: true }),
      },
      select: {
        galleryId: true,
        eventId: true,
        imageUrl: true,
        caption: true,
        location: true,
        date: true,
        isHero: true,
        isPublic: true,
        createdAt: true,
        event: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: images };
  } catch (error) {
    console.error("Error in getPublicGalleryImages:", error);
    return { success: false, data: [], message: "Failed to fetch gallery images." };
  }
}

/**
 * 2. Hero Section Images
 * - Admin/Moderator: isHero = true (isPublic true/false সব দেখবে)
 * - Public Visitor: isHero = true এবং isPublic = true
 */
export async function getHeroGalleryImages() {
  try {
    let isAdminOrModerator = false;

    try {
      const authResult = await verifyRole(["ADMIN", "MODERATOR"]);
      if (authResult && authResult.isAuthorized) {
        isAdminOrModerator = true;
      }
    } catch {
      isAdminOrModerator = false;
    }

    const images = await prisma.gallery.findMany({
      where: {
        isHero: true,
        ...(isAdminOrModerator ? {} : { isPublic: true }),
      },
      select: {
        galleryId: true,
        eventId: true,
        imageUrl: true,
        caption: true,
        location: true,
        date: true,
        isHero: true,
        isPublic: true,
        createdAt: true,
        event: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return { success: true, data: images };
  } catch (error) {
    console.error("Error in getHeroGalleryImages:", error);
    return { success: false, data: [], message: "Failed to fetch hero images." };
  }
}