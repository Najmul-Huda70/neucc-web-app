import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { JWTPayload } from "@/lib/types";
import { uploadProfileImage } from "@/lib/imageService";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || "fallback_super_secret_key";
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    return null;
  }
}

// GET: Fetch User Profile
export async function GET() {
  try {
    const sessionUser = await getAuthenticatedUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { userId: sessionUser.userId },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        image: true,
        status: true,
        createdAt: true,
        post: {
          select: {
            postId: true,
            postTitle: true,
            committee: {
              select: {
                id: true,
                type: true,
                session: true,
                status: true,
              },
            },
          },
        },
      },
    });

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

// PATCH: Update Profile Info, Password, Image or Remove Image
export async function PATCH(req: Request) {
  try {
    const sessionUser = await getAuthenticatedUser();
    if (!sessionUser) {
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
      where: { userId: sessionUser.userId },
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

    // 1. Password Change Logic
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

    // 2. Image Logic (Remove or Update)
    if (removeImage) {
      updateData.image = null;
    } else if (imageFile && imageFile.size > 0) {
      const uploadedImageUrl = await uploadProfileImage(imageFile);
      updateData.image = uploadedImageUrl;
    }

    // 3. Sync Database
    const updatedUser = await prisma.user.update({
      where: { userId: sessionUser.userId },
      data: updateData,
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        image: true,
        status: true,
        createdAt: true,
        post: {
          select: {
            postId: true,
            postTitle: true,
            committee: {
              select: {
                id: true,
                type: true,
                session: true,
                status: true,
              },
            },
          },
        },
      },
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