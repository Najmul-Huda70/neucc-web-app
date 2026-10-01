import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slugify";
import { EventStatus, EventType } from "@/generated/prisma/enums";
import { verifyRole } from "@/lib/auth";

const eventTypes = Object.values(EventType) as string[];
const eventStatuses = Object.values(EventStatus) as string[];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId: slug } = await params;
    const event = await prisma.events.findUnique({
      where: { slug },
      include: {
        committee: true,
        eventSponsors: { include: { sponsor: true }, orderBy: { displayOrder: "asc" } },
        eventResources: { orderBy: { createdAt: "asc" } },
        galleries: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!event) return NextResponse.json({ success: false, message: "Event not found." }, { status: 404 });
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Get Event API Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch event." }, { status: 500 });
  }
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const { eventId } = await params;
    const existing = await prisma.events.findUnique({ where: { eventId } });
    if (!existing) return NextResponse.json({ success: false, message: "Event not found." }, { status: 404 });

    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: "Request body must be an object." }, { status: 400 });
    }

    const start = body.start === undefined ? existing.start : body.start;
    const end = body.end === undefined ? existing.end : body.end;
    if (body.type !== undefined && !eventTypes.includes(body.type)) return NextResponse.json({ success: false, message: "type is invalid." }, { status: 400 });
    if (body.status !== undefined && !eventStatuses.includes(body.status)) return NextResponse.json({ success: false, message: "status is invalid." }, { status: 400 });
    if (body.shortDescription !== undefined && (typeof body.shortDescription !== "string" || body.shortDescription.length > 200)) return NextResponse.json({ success: false, message: "shortDescription must be 200 characters or fewer." }, { status: 400 });
    if (!isValidDate(start) && !(start instanceof Date)) return NextResponse.json({ success: false, message: "start must be a valid date." }, { status: 400 });
    if (end !== null && end !== undefined && !isValidDate(end) && !(end instanceof Date)) return NextResponse.json({ success: false, message: "end must be a valid date." }, { status: 400 });
    if (end && new Date(end) <= new Date(start)) return NextResponse.json({ success: false, message: "end must be after start." }, { status: 400 });
    if (body.committeeId !== undefined) {
      const committee = await prisma.committee.findUnique({ where: { committeeId: body.committeeId } });
      if (!committee) return NextResponse.json({ success: false, message: "Committee not found." }, { status: 404 });
    }

    const slug = body.slug === undefined ? existing.slug : await generateUniqueSlug(
      typeof body.slug === "string" && body.slug.trim() ? body.slug : (body.title ?? existing.title),
      (candidate) => prisma.events.findUnique({ where: { slug: candidate }, select: { eventId: true } }),
      eventId
    );

    const event = await prisma.events.update({
      where: { eventId },
      data: {
        ...(body.slug !== undefined ? { slug } : {}),
        ...(body.type !== undefined ? { type: body.type as EventType } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.shortDescription !== undefined ? { shortDescription: body.shortDescription } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.venue !== undefined ? { venue: body.venue } : {}),
        ...(body.committeeId !== undefined ? { committeeId: body.committeeId } : {}),
        ...(body.start !== undefined ? { start: new Date(body.start) } : {}),
        ...(body.end !== undefined ? { end: body.end ? new Date(body.end) : null } : {}),
        ...(body.status !== undefined ? { status: body.status as EventStatus } : {}),
        ...(body.bannerUrl !== undefined ? { bannerUrl: body.bannerUrl } : {}),
      },
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Update Event API Error:", error);
    return NextResponse.json({ success: false, message: "Failed to update event." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const { eventId } = await params;
    const event = await prisma.events.findUnique({ where: { eventId }, select: { eventId: true } });
    if (!event) return NextResponse.json({ success: false, message: "Event not found." }, { status: 404 });
    await prisma.events.delete({ where: { eventId } });
    return NextResponse.json({ success: true, message: "Event deleted." });
  } catch (error) {
    console.error("Delete Event API Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete event." }, { status: 500 });
  }
}