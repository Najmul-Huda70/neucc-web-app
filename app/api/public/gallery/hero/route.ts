// app/api/public/gallery/hero/route.ts
import { NextResponse } from "next/server";
import { getHeroGalleryImages } from "@/lib/services/gallery";

export async function GET() {
  try {
    const images = await getHeroGalleryImages();

    return NextResponse.json({ success: true, data: images }, { status: 200 });
  } catch (error) {
    console.error("Error in hero gallery API:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch hero images." },
      { status: 500 }
    );
  }
}