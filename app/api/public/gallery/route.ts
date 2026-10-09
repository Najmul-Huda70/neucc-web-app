import { getPublicGalleryImages } from "@/lib/services/gallery";
import { NextResponse } from "next/server";

export async function GET() {
  const images = await getPublicGalleryImages();
  return NextResponse.json({ success: true, data: images });
}