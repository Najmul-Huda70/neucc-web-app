import { NextResponse } from "next/server";
import { EventStatus, EventType } from "@/generated/prisma/enums";
import { getPublicEvents } from "@/lib/services/events";

const ALLOWED_EVENT_TYPES = new Set(Object.values(EventType));

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = Number.parseInt(searchParams.get("pageSize") ?? "20", 10);
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");
    const committeeId = searchParams.get("committeeId") || undefined;

    if (statusParam && statusParam !== EventStatus.PUBLISHED) {
      return NextResponse.json(
        { success: false, message: "Public events can only be queried with PUBLISHED status." },
        { status: 400 }
      );
    }

    if (typeParam && !ALLOWED_EVENT_TYPES.has(typeParam as EventType)) {
      return NextResponse.json(
        { success: false, message: "Type parameter is invalid." },
        { status: 400 }
      );
    }

    // Call the Service Function directly
    const data = await getPublicEvents({
      page,
      pageSize,
      type: typeParam ? (typeParam as EventType) : undefined,
      committeeId,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Public Get Events API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch public events." },
      { status: 500 }
    );
  }
}