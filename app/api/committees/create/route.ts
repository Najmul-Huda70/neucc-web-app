import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  sendCommitteeClosedNotification,
  sendNewAccountCredentials,
} from "@/lib/mailer";
import { verifyRole } from "@/lib/auth";
import { CommitteeType, Role, Status } from "@/lib/types";

// Strong Random Password Generator
function generateRandomPassword(length = 14): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}

export async function POST(req: Request) {
  try {
    // 🔒 1. Check if requesting user is an ACTIVE ADMIN
    const authCheck = await verifyRole([Role.ADMIN]);
    if (!authCheck.isAuthorized) {
      return NextResponse.json(
        { message: authCheck.message },
        { status: authCheck.status }
      );
    }

    const body = await req.json();

    const { type, year, postTitle, adminUserId, adminName, adminEmail } = body;

    // 2. Field Validation
    if (
      !type ||
      !year ||
      !postTitle ||
      !adminUserId ||
      !adminName ||
      !adminEmail
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔑 Auto-generate random password and hash it
    const plainAdminPassword = generateRandomPassword(14);
    const hashedPassword = await bcrypt.hash(plainAdminPassword, 10);

    let emailsToNotify: string[] = [];

    // 3. Atomic Database Transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Step A: Find currently ACTIVE committees
      const activeCommittees = await tx.committee.findMany({
        where: { status: Status.ACTIVE },
        select: { committeeId: true },
      });

      const activeCommitteeIds = activeCommittees.map((c) => c.committeeId);

      if (activeCommitteeIds.length > 0) {
        // Step B: Update userPost status to CLOSED for active committees
        await tx.userPost.updateMany({
          where: { committeeId: { in: activeCommitteeIds } },
          data: { status: Status.CLOSED },
        });

        // Step C: Collect active post users ID directly from DB
        const userIdsFromUserPost = await tx.userPost.findMany({
          where: { committeeId: { in: activeCommitteeIds } },
          select: { userId: true },
        });

        const usersIdToArray = Array.from(
          new Set(userIdsFromUserPost.map((u) => u.userId))
        );

        // Step D: Collect userId and email where role ADMIN OR MODERATOR (Fixed Typo)
        const usersToDowngrade = await tx.user.findMany({
          where: {
            userId: { in: usersIdToArray },
            role: { in: [Role.ADMIN, Role.MODERATOR] },
          },
          select: { userId: true, email: true },
        });

        emailsToNotify = Array.from(
          new Set(usersToDowngrade.map((u) => u.email))
        );

        const userIdsToDowngrade = Array.from(
          new Set(usersToDowngrade.map((u) => u.userId))
        );

        // Step E: Downgrade active committee admins/moderators to MEMBER
        if (userIdsToDowngrade.length > 0) {
          await tx.user.updateMany({
            where: { userId: { in: userIdsToDowngrade } },
            data: { role: Role.MEMBER },
          });
        }

        // Step F: Block old posts
        await tx.post.updateMany({
          where: { committeeId: { in: activeCommitteeIds } },
          data: { status: Status.CLOSED },
        });

        // Step G: Block old committees
        await tx.committee.updateMany({
          where: { committeeId: { in: activeCommitteeIds } },
          data: { status: Status.CLOSED },
        });
      }

      // Step H: Create New Committee
      const newCommittee = await tx.committee.create({
        data: {
          type: type as CommitteeType,
          year: year,
          status: Status.ACTIVE,
        },
      });

      // Step I: Create or Update New Admin User First
      const newAdmin = await tx.user.upsert({
        where: { userId: adminUserId },
        update: {
          role: Role.ADMIN,
          status: Status.ACTIVE,
        },
        create: {
          userId: adminUserId,
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
          status: Status.ACTIVE,
        },
      });

      // Step J: Create New Post for New Admin
      const newPost = await tx.post.create({
        data: {
          postTitle,
          committeeId: newCommittee.committeeId,
          status: Status.ACTIVE,
        },
      });

      // Step K: Create UserPost relation
      const newUserPost = await tx.userPost.create({
        data: {
          postId: newPost.postId,
          userId: newAdmin.userId,
          committeeId: newCommittee.committeeId,
          status: Status.ACTIVE,
        },
      });

      return { newCommittee, newPost, newAdmin, newUserPost };
    });

    // 4. Send Emails in Background

    // 📩 A. Send Committee Transition Notice to old Admins/Moderators
    if (emailsToNotify.length > 0) {
      await sendCommitteeClosedNotification(emailsToNotify).catch((err) =>
        console.error("Failed to send committee transition emails:", err)
      );
    }

    // 📩 B. Send Login Credentials to New Admin
    // Using transactionResult.newAdmin.userId prevents TS assignment errors
    await sendNewAccountCredentials({
      userId: transactionResult.newAdmin.userId,
      email: adminEmail,
      name: adminName,
      password: plainAdminPassword,
      role: Role.ADMIN,
      postTitle,
      customSubject: "🎉 Welcome! Your Admin Credentials - NEU Computer Club",
      customHeading: `Welcome to Executive Committee - ${year}!`,
    }).catch((err) =>
      console.error("Failed to send welcome credentials email:", err)
    );

    return NextResponse.json(
      {
        message:
          "New committee created successfully. Credentials sent to the new admin email.",
        data: transactionResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Committee API Error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}