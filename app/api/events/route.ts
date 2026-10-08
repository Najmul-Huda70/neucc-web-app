import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slugify";
import { EventStatus, EventType } from "@/generated/prisma/enums";
import { verifyRole } from "@/lib/auth";
import { z } from "zod";

const eventTypes = Object.values(EventType) as [string, ...string[]];
const eventStatuses = Object.values(EventStatus) as [string, ...string[]];

// Zod Schema for POST input validation
const CreateEventSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  shortDescription: z.string().min(1, "Short description is required").max(200, "Short description must be 200 characters or fewer").trim(),
  description: z.string().min(1, "Description is required").trim(),
  committeeId: z.string().min(1, "Committee ID is required"),
  type: z.enum(eventTypes as [string, ...string[]]),
  status: z.enum(eventStatuses as [string, ...string[]]).optional().default(EventStatus.DRAFT),
  slug: z.string().optional(),
  cardBannerUrl: z.string().url().nullable().optional(),
  detailBannerUrl: z.string().url().nullable().optional(),
});

// Explicit Public Select Matrix (Defensive Data Exposure)
const publicEventSelect = {
  eventId: true,
  slug: true,
  type: true,
  title: true,
  shortDescription: true,
  description: true,
  status: true,
  cardBannerUrl: true,
  detailBannerUrl: true,
  createdAt: true,
  committee: {
    select: {
      type: true,
      year: true,
    },
  },
};


export async function POST(req: Request) {
  
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);

  if (!auth.isAuthorized) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
    }

    const validation = CreateEventSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.format() },
        { status: 400 }
      );
    }

    const body = validation.data;

    const committee = await prisma.committee.findUnique({
      where: { committeeId: body.committeeId },
      select: { committeeId: true },
    });

    if (!committee) {
      return NextResponse.json({ success: false, message: "Committee not found." }, { status: 404 });
    }

    const slug = await generateUniqueSlug(
      body.slug?.trim() || body.title,
      (candidate) => prisma.events.findUnique({ where: { slug: candidate }, select: { eventId: true } })
    );

    const event = await prisma.events.create({
      data: {
        slug,
        type: body.type as EventType,
        title: body.title,
        shortDescription: body.shortDescription,
        description: body.description,
        committeeId: body.committeeId,
        status: body.status as EventStatus,
        cardBannerUrl: body.cardBannerUrl || null,
        detailBannerUrl: body.detailBannerUrl || null,
      },
      select: publicEventSelect, // Strictly select allowed fields on creation response
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("Create Events API Error:", error);
    return NextResponse.json({ success: false, message: "Failed to create event." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const auth = await verifyRole(["ADMIN", "MODERATOR"]);
    const { searchParams } = new URL(req.url);

    const page = Math.max(Number.parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(searchParams.get("pageSize") ?? "20", 10) || 20, 1), 100);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const committeeId = searchParams.get("committeeId");

    if (status && !eventStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "status is invalid." }, { status: 400 });
    }
    if (type && !eventTypes.includes(type)) {
      return NextResponse.json({ success: false, message: "type is invalid." }, { status: 400 });
    }

    // Public users can strictly query PUBLISHED events
    const filterStatus = auth.isAuthorized ? (status as EventStatus | null) : EventStatus.PUBLISHED;

    const where = {
      ...(filterStatus ? { status: filterStatus } : {}),
      ...(type ? { type: type as EventType } : {}),
      ...(committeeId ? { committeeId } : {}),
    };

    const [events, total] = await prisma.$transaction([
      prisma.events.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: publicEventSelect, // Sanitized Select Fields
      }),
      prisma.events.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: events,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error("Get Events API Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch events." }, { status: 500 });
  }
}