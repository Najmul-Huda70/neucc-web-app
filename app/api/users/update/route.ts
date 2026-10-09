import { NextResponse } from "next/server";
import { randomUUID, randomBytes } from "crypto";
import bcrypt from "bcryptjs"; // অথবা আপনার প্রজেক্টে ব্যবহৃত হ্যাশিং লাইব্রেরি
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";
import { sendRoleChangeNotification, sendStatusChangeNotification } from "@/lib/mailer";
import { Status } from "@/lib/types";

const ADMIN_MOD_ROLES = ["ADMIN"];

export async function PATCH(req: Request) {
  // 1. Authorization Check
  const auth = await verifyRole(["ADMIN"]);
  if (!auth.isAuthorized) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }
  const adminId = auth.user?.userId as string | undefined;

  try {
    const body = await req.json();
    const {
      userId,
      role,
      status,
      committeeId,
      postMode,
      existingPostId,
      newPostTitle,
      confirmRemovePost,
    } = body;

    // 2. Input Validation
    if (!userId || (!role && !status)) {
      return NextResponse.json(
        { success: false, message: "userId and at least one of role/status are required." },
        { status: 400 }
      );
    }

    if (userId === adminId && status === Status.CLOSED) {
      return NextResponse.json({ success: false, message: "You cannot Closed your own account." }, { status: 400 });
    }
    if (userId === adminId && role && role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "You cannot demote your own account." }, { status: 400 });
    }

    // 3. Find Target User
    const targetUser = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true, 
        role: true,
        status: true,
        user_posts: {
          where: {
            status: Status.ACTIVE,
          },
          select: {
            postId: true,
            committeeId: true
          }
        }
      }
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    const currentRole = targetUser.role;
    const isPromotingToLeadership = ADMIN_MOD_ROLES.includes(role) && currentRole === "MEMBER";
    const isDemotingToMember = role === "MEMBER" && ADMIN_MOD_ROLES.includes(currentRole);
    const hasActivePost = targetUser.user_posts.length > 0;

    // Validation for Promotion
    if (isPromotingToLeadership && !hasActivePost) {
      if (!committeeId) {
        return NextResponse.json({ success: false, message: "Committee is required to assign this role." }, { status: 400 });
      }
      if (postMode === "existing" && !existingPostId) {
        return NextResponse.json({ success: false, message: "Select an existing post to assign." }, { status: 400 });
      }
      if (postMode === "new" && !newPostTitle) {
        return NextResponse.json({ success: false, message: "Post title is required to create a new post." }, { status: 400 });
      }
    }

    // Validation for Demotion Confirmation
    if (isDemotingToMember && hasActivePost && !confirmRemovePost) {
      return NextResponse.json(
        { success: false, message: "This user currently holds a committee post. Confirm removal to demote to Member." },
        { status: 409 }
      );
    }

    let assignedPostTitle: string | undefined;
    let generatedPassword: string | undefined;
    let hashedPassword: string | undefined;

    // যদি স্ট্যাটাস পরিবর্তন করে ACTIVE করা হয় এবং আগের স্ট্যাটাস DEACTIVATED ছিল
    const isBeingActivated = status === Status.ACTIVE && targetUser.status !== Status.ACTIVE;

    if (isBeingActivated) {
      // ৮ অক্ষরের র‍্যান্ডম সিকিউর পাসওয়ার্ড তৈরি (যেমন: aB3xK9pL)
      generatedPassword = randomBytes(4).toString("hex");
      hashedPassword = await bcrypt.hash(generatedPassword, 10);
    }

    // 4. Clean & Readable Transaction Logic
    const updated = await prisma.$transaction(async (tx) => {

      // CASE 1: Promoted from MEMBER to MODERATOR / ADMIN
      if (isPromotingToLeadership && !hasActivePost) {
        let targetPostId = existingPostId;
        let targetCommitteeId = committeeId;

        if (postMode === "new") {
          const newPost = await tx.post.create({
            data: {
              postId: randomUUID(),
              postTitle: newPostTitle,
              committeeId,
              status: Status.ACTIVE,
            },
          });
          targetPostId = newPost.postId;
          assignedPostTitle = newPost.postTitle;
        } else if (postMode === "existing") {
          const existingPost = await tx.post.findUnique({
            where: { postId: existingPostId },
          });
          if (existingPost) {
            assignedPostTitle = existingPost.postTitle;
            targetCommitteeId = existingPost.committeeId;
          }
        }

        if (targetPostId) {
          await tx.userPost.create({
            data: {
              userId,
              postId: targetPostId,
              committeeId: targetCommitteeId,
              status: Status.ACTIVE,
            },
          });
        }
      }

      // CASE 2: Demoted from MODERATOR / ADMIN to MEMBER
      if (isDemotingToMember) {
        await tx.userPost.deleteMany({
          where: {
            userId,
            committeeId,
            status: Status.ACTIVE,
          }
        });
      }

      // Update User Record (Role, Status & Password if activated)
      return tx.user.update({
        where: { userId },
        data: {
          ...(role && { role }),
          ...(status && { status }),
          ...(hashedPassword && { password: hashedPassword }), // অ্যাকাউন্ট একটিভ করলে নতুন পাসওয়ার্ড হ্যাশ সেভ হবে
        },
        select: {
          userId: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      });
    });

    // 5. Send Notification Emails (Outside Transaction)
    try {
      if (role && role !== targetUser.role) {
        await sendRoleChangeNotification({
          email: updated.email,
          name: updated.name,
          oldRole: targetUser.role,
          newRole: role,
          postTitle: assignedPostTitle,
          postRemoved: isDemotingToMember,
        });
      }
      if (status && status !== targetUser.status) {
        await sendStatusChangeNotification({
          email: updated.email,
          name: updated.name,
          userId: updated.userId, // User ID পাস করা হলো
          status,
          password: generatedPassword, // পাসওয়ার্ড একটিভ হলে জেনারেট হওয়া প্লেন পাসওয়ার্ড পাঠানো হবে
        });
      }
    } catch (mailErr) {
      console.error("Failed to send update notification email:", mailErr);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ success: false, message: "Failed to update user." }, { status: 500 });
  }
}