import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

export const runtime = "nodejs";

// ==========================================
// POST: Assign a sponsor to an event
// ==========================================
export async function POST(req: Request) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const { eventId, sponsorId, tier, contactPerson, email, phone, displayOrder, isPublic, comment } = body;

    if (!eventId || !sponsorId) {
      return NextResponse.json(
        { success: false, message: "Event ID and Sponsor ID are required." },
        { status: 400 }
      );
    }

    // চেক করা যে এই ইভেন্টে অলরেডি এই স্পন্সর যুক্ত আছে কি না
    const existingLink = await prisma.eventSponsor.findFirst({
      where: { eventId, sponsorId },
    });

    if (existingLink) {
      return NextResponse.json(
        { success: false, message: "This company is already a sponsor for this event." },
        { status: 400 }
      );
    }

    const eventSponsor = await prisma.eventSponsor.create({
      data: {
        eventId,
        sponsorId,
        tier: tier || null,
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
        displayOrder: displayOrder ?? 0,
        isPublic: isPublic ?? false,
        comment: comment || null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Sponsor assigned to event successfully.", data: eventSponsor },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Event Sponsor Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT: Update an existing EventSponsor relation
// ==========================================
export async function PUT(req: Request) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const { id, tier, contactPerson, email, phone, displayOrder, isPublic, comment } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "EventSponsor ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.eventSponsor.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Event sponsor record not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.eventSponsor.update({
      where: { id },
      data: {
        tier: tier !== undefined ? tier : existing.tier,
        contactPerson: contactPerson !== undefined ? contactPerson : existing.contactPerson,
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        displayOrder: displayOrder !== undefined ? displayOrder : existing.displayOrder,
        isPublic: isPublic !== undefined ? isPublic : existing.isPublic,
        comment: comment !== undefined ? comment : existing.comment,
      },
    });

    return NextResponse.json(
      { success: true, message: "Event sponsor updated successfully.", data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Event Sponsor Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE: Remove sponsor from the event
// ==========================================
export async function DELETE(req: Request) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "EventSponsor ID is required in query params (e.g. ?id=xyz)." },
        { status: 400 }
      );
    }

    const existing = await prisma.eventSponsor.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Event sponsor record not found." },
        { status: 404 }
      );
    }

    await prisma.eventSponsor.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Sponsor removed from event successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Event Sponsor Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}