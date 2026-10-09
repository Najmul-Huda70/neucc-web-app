import { NextResponse } from "next/server";
import { getPublicGalleryImages } from "@/lib/services/gallery";

export async function GET() {
  const result = await getPublicGalleryImages();

  if (!result.success) {
    return NextResponse.json(
      { success: false, message: result.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
}