import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

export async function DELETE(req: Request) {
  // 1. Authorization Check (Only ADMIN allowed)
  const auth = await verifyRole(["ADMIN"]);
  if (!auth.isAuthorized) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const adminId = auth.user?.userId as string | undefined;

  try {
    // Request Body থেকে userId রিড করা
    const body = await req.json();
    const { userId: userIdToDelete } = body;

    // 2. Input Validation
    if (!userIdToDelete) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 }
      );
    }

    // Prevent Admin from deleting their own account
    if (userIdToDelete === adminId) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own admin account." },
        { status: 400 }
      );
    }

    // 3. Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { userId: userIdToDelete },
      select: { userId: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    // 4. Transaction Scope: Cascade Delete UserPosts then Delete User
    await prisma.$transaction(async (tx) => {
      // Step A: Delete all posts associated with this user in UserPost table
      await tx.userPost.deleteMany({
        where: { userId: userIdToDelete },
      });

      // Step B: Delete the user record
      await tx.user.delete({
        where: { userId: userIdToDelete },
      });
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} and their assigned posts have been permanently deleted.`,
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user. Please try again." },
      { status: 500 }
    );
  }
}