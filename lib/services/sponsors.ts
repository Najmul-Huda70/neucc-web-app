// lib/services/sponsors.ts
import { prisma } from "@/lib/prisma";

export const publicSponsorSelect = {
  sponsorId: true,
  name: true,
  logoUrl: true,
  website: true,
};

// Common Get Sponsors Function with optional admin fields
export async function getSponsors(includeAdminFields: boolean = false) {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { name: "asc" },
      select: {
        ...publicSponsorSelect,
        ...(includeAdminFields && {
          createdAt: true,
          _count: {
            select: { eventSponsors: true },
          },
        }),
      },
    });

    return sponsors;
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return [];
  }
}

// Wrapper for Public usage
export async function getPublicSponsors() {
  return await getSponsors(false);
}

// Wrapper for Admin usage
export async function getAdminSponsors() {
  return await getSponsors(true);
}

// sponsorId er details ebong eventSponsors gulo fetch korar function
export async function getSponsorDetailsById(sponsorId: string) {
  try {
    const sponsor = await prisma.sponsor.findUnique({
      where: { sponsorId },
      select: {
        sponsorId: true,
        name: true,
        logoUrl: true,
        website: true,
        eventSponsors: {
          select: {
            id: true, 
            tier: true, 
            contactPerson: true,
            email: true,
            phone: true,
            comment: true,
            isPublic: true,
            event: {
              select: {
                eventId: true, 
                title: true, 
                slug: true,
              },
            },
          },
        },
      },
    });

    return sponsor;
  } catch (error) {
    console.error("Error fetching sponsor details:", error);
    return null;
  }
}