import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { JWTPayload } from "@/lib/types";
import { uploadProfileImage } from "@/lib/imageService";
import { getUserProfile, userProfileSelect } from "@/lib/services/users";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_super_secret_key"
);

async function getAuthenticatedUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// GET: Fetch User Profile
export async function GET() {
  try {
    const yearUser = await getAuthenticatedUser();
    if (!yearUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // হেলপার ফাংশন থেকে ফেচ করা হচ্ছে
    const userProfile = await getUserProfile(yearUser.userId);

    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userProfile }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH: Update Profile Info
export async function PATCH(req: Request) {
  try {
    const yearUser = await getAuthenticatedUser();
    if (!yearUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const currentPassword = formData.get("currentPassword") as string | null;
    const newPassword = formData.get("newPassword") as string | null;
    const imageFile = formData.get("image") as File | null;
    const removeImage = formData.get("removeImage") === "true";

    const existingUser = await prisma.user.findUnique({
      where: { userId: yearUser.userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      image?: string | null;
    } = {};

    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();

    // 1. Passordendring
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.password
      );
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // 2. Bildehåndtering
    if (removeImage) {
      updateData.image = null;
    } else if (imageFile && imageFile.size > 0) {
      const uploadedImageUrl = await uploadProfileImage(imageFile);
      updateData.image = uploadedImageUrl;
    }

    // 3. Oppdatering i databasen
    const updatedUser = await prisma.user.update({
      where: { userId: yearUser.userId },
      data: updateData,
      select: userProfileSelect,
    });

    return NextResponse.json(
      { message: "Profile updated successfully!", user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}