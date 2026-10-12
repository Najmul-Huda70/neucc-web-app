import { prisma } from "@/lib/prisma";



export const publicGallerySelect = {

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

};



// Public Gallery Page Images

export async function getPublicGalleryImages() {

  try {

    const images = await prisma.gallery.findMany({

      where: {

        isPublic: true,

        isHero: false,

      },

      orderBy: { createdAt: "desc" },

      select: publicGallerySelect,

    });



    return images;

  } catch (error) {

    console.error("Error fetching public gallery images:", error);

    return [];

  }

}



// Public Hero Slider Images (SSR Ready)

import { unstable_cache } from "next/cache";

async function fetchHeroGalleryImages() {
  try {
    const images = await prisma.gallery.findMany({
      where: {
        isHero: true,
        isPublic: true,
      },
      select: {
        galleryId: true,
        imageUrl: true,
        caption: true,
        location: true,
        date: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return images;
  } catch (error) {
    console.error("Error in fetchHeroGalleryImages:", error);
    return [];
  }
}

// Cached Hero Gallery Images (30 Minutes Cache)
export const getHeroGalleryImages = unstable_cache(
  async () => fetchHeroGalleryImages(),
  ["hero-gallery-images-cache"],
  {
    revalidate: 1800, // 30 minutes
    tags: ["hero-gallery"],
  }
);