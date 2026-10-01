import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await verifyRole(["ADMIN", "MODERATOR"]);
  if (!auth.isAuthorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, message: "An image file is required." }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "Image must be 5 MB or smaller." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await new Promise<string>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: "neucc/events", resource_type: "image" },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(error ?? new Error("Cloudinary did not return an image URL."));
            return;
          }
          resolve(result.secure_url);
        }
      );
      upload.end(buffer);
    });

    return NextResponse.json({ success: true, data: { url } }, { status: 201 });
  } catch (error) {
    console.error("Event banner upload error:", error);
    return NextResponse.json({ success: false, message: "Failed to upload event banner." }, { status: 500 });
  }
}