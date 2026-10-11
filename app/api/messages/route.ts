import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadImage, deleteImage, extractPublicId } from "@/lib/cloudinary";

// ==========================================
// 1. CREATE NEW MESSAGE (POST)
// ==========================================
export async function POST(req: Request) {
  try {
    const auth = await verifyRole(["ADMIN"]);
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.message }, { status: auth.status });
    }

    const formData = await req.formData();
    const role = formData.get("role") as "CHAIRMAN" | "ADVISOR";
    const name = formData.get("name") as string;
    const designation = formData.get("designation") as string;
    const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;
    const message = formData.get("message") as string;
    const imageFile = formData.get("image") as File | null;

    if (!role || !name || !designation || !message) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    // CHECK IF CHAIRMAN ALREADY EXISTS
    if (role === "CHAIRMAN") {
      const existingChairman = await prisma.message.findFirst({
        where: { role: "CHAIRMAN" },
      });
      if (existingChairman) {
        return NextResponse.json(
          { error: "A Chairman message already exists! Please delete or edit the existing Chairman message." },
          { status: 400 }
        );
      }
    }

    let photoUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64Data = buffer.toString("base64");
      const fileUri = `data:${imageFile.type};base64,${base64Data}`;
      photoUrl = await uploadImage(fileUri, "neucc/messages");
    }

    const newMessage = await prisma.message.create({
      data: {
        role,
        name,
        designation,
        photoUrl,
        displayOrder,
        message,
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard/messages");

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}

// ==========================================
// 2. UPDATE MESSAGE (PATCH)
// ==========================================
export async function PATCH(req: Request) {
  try {
    const auth = await verifyRole(["ADMIN"]);
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.message }, { status: auth.status });
    }

    const formData = await req.formData();
    const messageId = formData.get("messageId") as string;
    const role = formData.get("role") as "CHAIRMAN" | "ADVISOR";
    const name = formData.get("name") as string;
    const designation = formData.get("designation") as string;
    const displayOrder = formData.get("displayOrder") ? parseInt(formData.get("displayOrder") as string) : undefined;
    const message = formData.get("message") as string;
    const imageFile = formData.get("image") as File | null;

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const existingMessage = await prisma.message.findUnique({ where: { messageId } });
    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // CHECK IF UPDATING TO CHAIRMAN WHEN ANOTHER CHAIRMAN EXISTS
    if (role === "CHAIRMAN" && existingMessage.role !== "CHAIRMAN") {
      const existingChairman = await prisma.message.findFirst({
        where: { role: "CHAIRMAN" },
      });
      if (existingChairman) {
        return NextResponse.json(
          { error: "A Chairman message already exists! Delete the old Chairman before reassigning." },
          { status: 400 }
        );
      }
    }

    let photoUrl = existingMessage.photoUrl;

    if (imageFile && imageFile.size > 0) {
      if (existingMessage.photoUrl) {
        const publicId = extractPublicId(existingMessage.photoUrl);
        if (publicId) await deleteImage(publicId);
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64Data = buffer.toString("base64");
      const fileUri = `data:${imageFile.type};base64,${base64Data}`;
      photoUrl = await uploadImage(fileUri, "neucc/messages");
    }

    const updatedMessage = await prisma.message.update({
      where: { messageId },
      data: {
        ...(role && { role }),
        ...(name && { name }),
        ...(designation && { designation }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(message && { message }),
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard/messages");

    return NextResponse.json({ success: true, data: updatedMessage }, { status: 200 });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

// ==========================================
// 3. PERMANENT DELETE MESSAGE (DELETE)
// ==========================================
export async function DELETE(req: Request) {
  try {
    const auth = await verifyRole(["ADMIN"]);
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.message }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const message = await prisma.message.findUnique({ where: { messageId } });
    if (message && message.photoUrl) {
      const publicId = extractPublicId(message.photoUrl);
      if (publicId) await deleteImage(publicId);
    }

    await prisma.message.delete({ where: { messageId } });

    revalidatePath("/");
    revalidatePath("/dashboard/messages");

    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}