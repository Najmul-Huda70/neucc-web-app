import { prisma } from "@/lib/prisma";
import { EventStatus, EventType } from "@/generated/prisma/enums";

// Shared Select Object
export const publicEventSelect = {
  eventId: true,
  slug: true,
  title: true,
  type: true,
  shortDescription: true,
  cardBannerUrl: true,
  startDate: true,
  endDate: true,
  vanue: true,
  committee: {
    select: {
      type: true,
      year: true,
    },
  },
};

export type PublicEventsQuery = {
  page?: number;
  pageSize?: number;
  type?: EventType;
  committeeId?: string;
};

// Main Service Function
export async function getPublicEvents(params: PublicEventsQuery = {}) {
  const page = Math.max(params.page || 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize || 20, 1), 100);

  const where = {
    status: EventStatus.PUBLISHED,
    ...(params.type ? { type: params.type } : {}),
    ...(params.committeeId ? { committeeId: params.committeeId } : {}),
  };

  const [events, total] = await Promise.all([
    prisma.events.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: publicEventSelect,
    }),
    prisma.events.count({ where }),
  ]);

  return {
    items: events,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getPublicEventBySlug(slug: string) {
  const event = await prisma.events.findUnique({
    where: {
      slug,
      status: EventStatus.PUBLISHED, 
    },
    select: {
      eventId: true,
      slug: true,
      title: true,
      type: true,
      shortDescription: true,
      description: true,
      cardBannerUrl: true,
      detailBannerUrl: true,
      startDate: true,
      endDate: true,
      vanue: true,
      status: true,
      committee: {
        select: {
          type: true,
          year: true,
        },
      },
      eventSponsors: {
        where: { isPublic: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          tier: true,
          displayOrder: true,
          sponsor: {
            select: {
              sponsorId: true,
              name: true,
              logoUrl: true,
              website: true,
            },
          },
        },
      },
      galleries: {
        where: { isPublic: true, isHero: false },
        orderBy: { createdAt: "asc" },
        select: {
          galleryId: true,
          imageUrl: true,
          caption: true,
          location: true,
          date: true,
          isPublic: true,
        },
      },
    },
  });

  if (!event) return null;

  // Fetch 3 related published events of the same type
  const relatedEvents = await prisma.events.findMany({
    where: {
      eventId: { not: event.eventId },
      type: event.type,
      status: EventStatus.PUBLISHED,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      eventId: true,
      slug: true,
      title: true,
      shortDescription: true,
      type: true,
      cardBannerUrl: true,
      startDate: true,
      endDate: true,
      vanue: true,
      committee: {
        select: {
          type: true,
          year: true,
        },
      },
    },
  });

  return {
    ...event,
    relatedEvents,
  };
}