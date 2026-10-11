import { prisma } from "@/lib/prisma";

export const publicSponsorSelect = {
  sponsorId: true,
  name: true,
  logoUrl: true,
  website: true,
  _count: {
    select: { eventSponsors: true },
  },
};

// Common Get Sponsors Function
export async function getSponsors() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { name: "asc" },
      select: {
        ...publicSponsorSelect,
        createdAt: true,
      },
    });

    return sponsors;
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return [];
  }
}

// Public & Admin-er jonyo common alias wrapper
export async function getPublicSponsors() {
  return await getSponsors();
}

export async function getAdminSponsors() {
  return await getSponsors();
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