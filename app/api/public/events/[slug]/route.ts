import { getPublicEventBySlug } from "@/lib/services/events";
import { NextResponse } from "next/server";

type ParamsPromise = Promise<{ slug: string }>;

export async function GET(
  _req: Request,
  props: { params: ParamsPromise }
) {
  try {
    const { slug } = await props.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Event slug is required." },
        { status: 400 }
      );
    }

    const eventData = await getPublicEventBySlug(slug);

    if (!eventData) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: eventData });
  } catch (error) {
    console.error("Get Public Event Details Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event details." },
      { status: 500 }
    );
  }
}