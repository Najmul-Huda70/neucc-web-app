import { NextResponse } from "next/server";
import { getHeroGalleryImages } from "@/lib/services/gallery";

export async function GET() {
  const result = await getHeroGalleryImages();

  if (!result.success) {
    return NextResponse.json(
      { success: false, message: result.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
}