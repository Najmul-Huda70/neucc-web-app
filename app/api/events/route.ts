import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slugify";
import { EventStatus, EventType } from "@/generated/prisma/enums";
import { verifyRole } from "@/lib/auth";

const eventTypes = Object.values(EventType) as string[];
const eventStatuses = Object.values(EventStatus) as string[];

function validateEventFields(body: Record<string, unknown>) {
  const requiredFields = ["title", "shortDescription", "description", "committeeId", "type"];
  const missingField = requiredFields.find(
    (field) => typeof body[field] !== "string" || !(body[field] as string).trim()
  );

  if (missingField) return `${missingField} is required.`;
  if (!eventTypes.includes(body.type as string)) return "type is invalid.";
  if (body.status !== undefined && !eventStatuses.includes(body.status as string)) return "status is invalid.";
  if ((body.shortDescription as string).length > 200) return "shortDescription must be 200 characters or fewer.";
  return null;
}

export async function POST(req: Request) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: "Request body must be an object." }, { status: 400 });
    }

    const validationError = validateEventFields(body);
    if (validationError) return NextResponse.json({ success: false, message: validationError }, { status: 400 });

    const committee = await prisma.committee.findUnique({ where: { committeeId: body.committeeId as string } });
    if (!committee) return NextResponse.json({ success: false, message: "Committee not found." }, { status: 404 });

    const slug = await generateUniqueSlug(
      typeof body.slug === "string" && body.slug.trim() ? body.slug : body.title as string,
      (candidate) => prisma.events.findUnique({ where: { slug: candidate }, select: { eventId: true } })
    );

    const event = await prisma.events.create({
      data: {
        slug,
        type: body.type as EventType,
        title: body.title as string,
        shortDescription: body.shortDescription as string,
        description: body.description as string,
        committeeId: body.committeeId as string,
        status: (body.status as EventStatus | undefined) ?? EventStatus.DRAFT,
        cardBannerUrl: typeof body.cardBannerUrl === "string" ? body.cardBannerUrl : null,
        detailBannerUrl: typeof body.detailBannerUrl === "string" ? body.detailBannerUrl : null,
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("Create Events API Error:", error);
    return NextResponse.json({ success: false, message: "Failed to create event." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const auth = await verifyRole(["ADMIN", "MODERATOR", "MEMBER"]);
    const searchParams = new URL(req.url).searchParams;
    const page = Math.max(Number.parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(searchParams.get("pageSize") ?? "20", 10) || 20, 1), 100);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const committeeId = searchParams.get("committeeId");

    if (status && !eventStatuses.includes(status)) return NextResponse.json({ success: false, message: "status is invalid." }, { status: 400 });
    if (type && !eventTypes.includes(type)) return NextResponse.json({ success: false, message: "type is invalid." }, { status: 400 });

    const publicStatus = auth.isAuthorized ? status : "PUBLISHED";
    const where = {
      ...(publicStatus ? { status: publicStatus as EventStatus } : {}),
      ...(type ? { type: type as EventType } : {}),
      ...(committeeId ? { committeeId } : {}),
    };
    const [events, total] = await prisma.$transaction([
      prisma.events.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          committee: { select: { type: true, year: true } },
        },
      }),
      prisma.events.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { items: events, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } } });
  } catch (error) {
    console.error("Get Events API Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch events." }, { status: 500 });
  }
}