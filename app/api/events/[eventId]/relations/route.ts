import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";
import { SponsorTier } from "@/generated/prisma/enums";

type RelationBody = Record<string, unknown>;

const sponsorTiers = Object.values(SponsorTier) as string[];

function optionalDate(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

function invalidDate(value: unknown) {
  return value !== undefined && value !== null && value !== "" && !optionalDate(value);
}

async function eventExists(eventId: string) {
  return prisma.events.findUnique({ where: { eventId }, select: { eventId: true } });
}

export async function POST(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const { eventId } = await params;
    if (!(await eventExists(eventId))) return NextResponse.json({ success: false, message: "Event not found." }, { status: 404 });
    const body = (await req.json()) as RelationBody;
    const relation = body.relation;

    if (relation === "sponsor") {
      if (typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ success: false, message: "Sponsor name is required." }, { status: 400 });
      if (body.tier && !sponsorTiers.includes(body.tier as string)) return NextResponse.json({ success: false, message: "Sponsor tier is invalid." }, { status: 400 });
      const result = await prisma.$transaction(async (tx) => {
        const sponsor = await tx.sponsor.create({ data: { name: body.name as string, logoUrl: typeof body.logoUrl === "string" ? body.logoUrl : null, website: typeof body.website === "string" ? body.website : null } });
        return tx.eventSponsor.create({ data: { eventId, sponsorId: sponsor.sponsorId, tier: (body.tier as SponsorTier | undefined) ?? null, isPublic: body.isPublic === true, comment: typeof body.comment === "string" ? body.comment : null }, include: { sponsor: true } });
      });
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    }

    if (relation === "gallery") {
      if (typeof body.imageUrl !== "string" || !body.imageUrl.trim()) return NextResponse.json({ success: false, message: "Gallery image is required." }, { status: 400 });
      if (invalidDate(body.date)) return NextResponse.json({ success: false, message: "Gallery date must be valid." }, { status: 400 });
      const result = await prisma.gallery.create({ data: { eventId, imageUrl: body.imageUrl as string, caption: typeof body.caption === "string" ? body.caption : null, location: typeof body.location === "string" ? body.location : null, date: optionalDate(body.date), isPublic: body.isPublic !== false } });
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    }

    return NextResponse.json({ success: false, message: "Unsupported relation." }, { status: 400 });
  } catch (error) {
    console.error("Create event relation error:", error);
    return NextResponse.json({ success: false, message: "Failed to create event relation." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const { eventId } = await params;
    const body = (await req.json()) as RelationBody;
    const relationId = typeof body.relationId === "string" ? body.relationId : "";
    if (!relationId) return NextResponse.json({ success: false, message: "relationId is required." }, { status: 400 });

    if (body.relation === "sponsor") {
      const eventSponsor = await prisma.eventSponsor.findFirst({ where: { id: relationId, eventId }, select: { sponsorId: true } });
      if (!eventSponsor) return NextResponse.json({ success: false, message: "Event sponsor not found." }, { status: 404 });
      const result = await prisma.$transaction(async (tx) => {
        await tx.sponsor.update({ where: { sponsorId: eventSponsor.sponsorId }, data: { ...(typeof body.name === "string" ? { name: body.name } : {}), ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl as string || null } : {}), ...(body.website !== undefined ? { website: body.website as string || null } : {}) } });
        return tx.eventSponsor.update({ where: { id: relationId }, data: { ...(body.tier !== undefined ? { tier: body.tier ? body.tier as SponsorTier : null } : {}), ...(body.isPublic !== undefined ? { isPublic: body.isPublic === true } : {}), ...(body.comment !== undefined ? { comment: body.comment as string || null } : {}) }, include: { sponsor: true } });
      });
      return NextResponse.json({ success: true, data: result });
    }

    if (body.relation === "gallery") {
      const existing = await prisma.gallery.findFirst({ where: { galleryId: relationId, eventId } });
      if (!existing) return NextResponse.json({ success: false, message: "Gallery item not found." }, { status: 404 });
      if (body.date !== undefined && invalidDate(body.date)) return NextResponse.json({ success: false, message: "Gallery date must be valid." }, { status: 400 });
      const result = await prisma.gallery.update({ where: { galleryId: relationId }, data: { ...(typeof body.imageUrl === "string" ? { imageUrl: body.imageUrl } : {}), ...(body.caption !== undefined ? { caption: body.caption as string || null } : {}), ...(body.location !== undefined ? { location: body.location as string || null } : {}), ...(body.date !== undefined ? { date: optionalDate(body.date) } : {}), ...(body.isPublic !== undefined ? { isPublic: body.isPublic === true } : {}) } });
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, message: "Unsupported relation." }, { status: 400 });
  } catch (error) {
    console.error("Update event relation error:", error);
    return NextResponse.json({ success: false, message: "Failed to update event relation." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { eventId } = await params;
    const body = (await req.json()) as RelationBody;
    const relationId = typeof body.relationId === "string" ? body.relationId : "";
    if (body.relation === "sponsor") await prisma.eventSponsor.deleteMany({ where: { id: relationId, eventId } });
    else if (body.relation === "gallery") await prisma.gallery.deleteMany({ where: { galleryId: relationId, eventId } });
    else return NextResponse.json({ success: false, message: "Unsupported relation." }, { status: 400 });
    return NextResponse.json({ success: true, message: "Relation deleted." });
  } catch (error) {
    console.error("Delete event relation error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete event relation." }, { status: 500 });
  }
}