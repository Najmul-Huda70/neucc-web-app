// app/api/auth/self-block/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth";
import { sendSelfBlockConfirmationEmail } from "@/lib/mailer";

export async function POST() {
  try {
    // 1. Verify authenticated admin
    const authUser = await verifyAdminAccess();
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized access or session expired" },
        { status: 401 }
      );
    }

    const { userId, role } = authUser;

    // 2. Fetch full user data including post
    const currentUser = await prisma.user.findUnique({
      where: { userId },
      include: { post: true },
    });

    if (!currentUser || currentUser.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "User account is not active or does not exist" },
        { status: 400 }
      );
    }

    // 3. SUPER_ADMIN Minimum Active Count Check
    if (role === "SUPER_ADMIN") {
      const activeSuperAdminCount = await prisma.user.count({
        where: {
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          userId: { not: userId }, // Exclude current super admin
        },
      });

      if (activeSuperAdminCount < 1) {
        return NextResponse.json(
          {
            error:
              "Cannot block your account. At least one other active Super Admin must exist in the system.",
          },
          { status: 403 }
        );
      }
    }

    // 4. Atomic Transaction: Block User & Associated Post (if assigned)
    await prisma.$transaction(async (tx) => {
      // Update User status to BLOCKED
      await tx.user.update({
        where: { userId },
        data: { status: "BLOCKED" },
      });

      // If user holds an admin Post, set that Post status to BLOCKED as well
      if (currentUser.postId) {
        await tx.post.update({
          where: { postId: currentUser.postId },
          data: { status: "BLOCKED" },
        });
      }
    });

    // 5. Clear Auth Token Cookie
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    });

    // 6. Send Async Self-Block Confirmation Email
    sendSelfBlockConfirmationEmail(
      currentUser.email,
      currentUser.name,
      currentUser.userId,
      currentUser.role
    ).catch((err) => {
      console.error("Failed to send self-block notification email:", err);
    });

    return NextResponse.json(
      {
        message: "Your account has been successfully blocked and logged out.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in self-block API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during self-block" },
      { status: 500 }
    );
  }
}