import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";
import { sendNewAccountCredentials } from "@/lib/mailer";
import { Status } from "@/lib/types";

export async function POST(req: Request) {
  // 1. Authorization Check
  const auth = await verifyRole(["ADMIN"]);
  if (!auth.isAuthorized) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const {
      userId,
      name,
      email,
      password,
      role,
      isCommitteeMember,
      committeeId,
      postMode,
      existingPostId,
      newPostTitle,
    } = body;

    // 2. Input Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    if (isCommitteeMember) {
      if (!committeeId) {
        return NextResponse.json(
          { success: false, message: "Committee is required for a committee member." },
          { status: 400 }
        );
      }
      if (postMode === "existing" && !existingPostId) {
        return NextResponse.json(
          { success: false, message: "Select an existing post to assign." },
          { status: 400 }
        );
      }
      if (postMode === "new" && !newPostTitle) {
        return NextResponse.json(
          { success: false, message: "Post title is required to create a new post." },
          { status: 400 }
        );
      }
    }

    // 3. Duplicate User Id and Email Check
    const existingUser = await prisma.user.findFirst({
      where:
      {
        OR: [{ email }, { userId }]
      }
    });
    if (existingUser) {
      const isEmailDuplicate = existingUser.email === email;
      return NextResponse.json(
        {
          success: false,
          message: isEmailDuplicate
            ? "A user with this email already exists."
            : "A user with this User ID already exists."
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let assignedPostTitle: string | undefined;

    // 4. Prisma Atomic Transaction
    await prisma.$transaction(async (tx) => {
      // Step A: User Creation
      await tx.user.create({
        data: {
          userId,
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      // Step B & C: Committee & Post Assignment
      if (isCommitteeMember) {
        let targetPostId = existingPostId;

        if (postMode === "new") {
          // Create new post under committee
          const newPost = await tx.post.create({
            data: {
              postId: randomUUID(),
              postTitle: newPostTitle,
              status: Status.ACTIVE,
              committeeId,
            },
          });
          targetPostId = newPost.postId;
          assignedPostTitle = newPost.postTitle;
        } else if (postMode === "existing") {
          // Find existing post title for email notification
          const post = await tx.post.findUnique({
            where: { postId: existingPostId },
          });
          if (post) assignedPostTitle = post.postTitle;
        }

        // Link User and Post in UserPost join table
        if (targetPostId) {
          await tx.userPost.create({
            data: {
              userId,
              postId: targetPostId,
              committeeId,
              status: Status.ACTIVE,
            },
          });
        }
      }
    });

    // 5. Send Email Credentials (Outside Transaction)
    try {
      await sendNewAccountCredentials({
        userId,
        email,
        name,
        password,
        role,
        postTitle: assignedPostTitle,
      });
    } catch (mailErr) {
      console.error("Failed to send account creation email:", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "User account and committee designation created successfully.",
    });
  } catch (error) {
    console.error("User creation transaction error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user due to a server error." },
      { status: 500 }
    );
  }
}