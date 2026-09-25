import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { JWTPayload } from "@/lib/types";
import { sendBlockNotificationEmail } from "@/lib/mailer";

async function verifyAdminAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || "fallback_super_secret_key";
    const decoded = jwt.verify(token, secret) as JWTPayload;

    if (decoded.role === "SUPER_ADMIN" || decoded.role === "ADMIN") {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

// PATCH: Block Committee Permanently, Block Posts, Block Users & Send Email
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAdminAccess();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, blockReason } = body;

    // Check if Committee exists
    const existingCommittee = await prisma.committee.findUnique({
      where: { id },
    });

    if (!existingCommittee) {
      return NextResponse.json({ error: "Committee not found!" }, { status: 404 });
    }

    // Security Check: Prevent reactivating a BLOCKED committee
    if (existingCommittee.status === "BLOCKED") {
      return NextResponse.json(
        { error: "This committee is already blocked and cannot be reactivated!" },
        { status: 400 }
      );
    }

    if (!blockReason || !blockReason.trim()) {
      return NextResponse.json(
        { error: "Reason for blocking is required!" },
        { status: 400 }
      );
    }

    const targetStatus = status || "BLOCKED";

    // Transaction for Atomic Updates (Committee + Posts + Users)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Committee Status
      const updatedCommittee = await tx.committee.update({
        where: { id },
        data: {
          status: targetStatus,
          blockReason: blockReason.trim(),
        },
      });

      // 2. Find all Posts under this Committee
      const posts = await tx.post.findMany({
        where: { committeeId: id },
        select: { postId: true },
      });

      const postIds = posts.map((p) => p.postId);

      // 3. Block all Posts under this Committee
      if (postIds.length > 0) {
        await tx.post.updateMany({
          where: { postId: { in: postIds } },
          data: { status: "BLOCKED" },
        });
      }

      // 4. Find all Users assigned to these Posts
      // Note: Replaced `id: true` with `userId: true`
      const usersToBlock = await tx.user.findMany({
        where: { postId: { in: postIds } },
        select: { userId: true, email: true, name: true },
      });

      const userIdsToBlock = usersToBlock.map((u) => u.userId);

      // 5. Block all associated Users using `userId`
      if (userIdsToBlock.length > 0) {
        await tx.user.updateMany({
          where: { userId: { in: userIdsToBlock } },
          data: { status: "BLOCKED" },
        });
      }

      return {
        committee: updatedCommittee,
        blockedUsers: usersToBlock,
      };
    });

    // Send block notification email to each blocked user
    if (result.blockedUsers.length > 0) {
      Promise.allSettled(
        result.blockedUsers.map((u) =>
          sendBlockNotificationEmail(
            u.email,
            u.name,
            existingCommittee.type,
            existingCommittee.session,
            blockReason.trim()
          )
        )
      ).catch((err) => console.error("Block Email Error:", err));
    }

    return NextResponse.json(
      {
        message: "Committee, associated posts, and users have been permanently blocked!",
        committee: result.committee,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PATCH Committee Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update committee status" },
      { status: 500 }
    );
  }
}