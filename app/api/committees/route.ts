import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { JWTPayload } from "@/lib/types";
import { sendAdminCredentialsEmail } from "@/lib/mailer";

// Valid Committee Types
const VALID_COMMITTEE_TYPES = ["ADVISOR", "EXECUTIVE", "ELECTION"];

// Admin / SuperAdmin verification helper
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

// Password Generator
function generatePassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// GET: Fetch all committees with posts & assigned users
export async function GET() {
  try {
    const user = await verifyAdminAccess();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const committees = await prisma.committee.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        posts: {
          include: {
            users: {
              select: {
                userId: true,
                name: true,
                email: true,
                role: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ committees }, { status: 200 });
  } catch (error) {
    console.error("GET Committees Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create Committee + Posts + Admin Accounts
export async function POST(req: Request) {
  try {
    const user = await verifyAdminAccess();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { type, session, status, admins } = body;

    // 1. Basic Validations
    if (!type || !VALID_COMMITTEE_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid Committee Type!" },
        { status: 400 }
      );
    }

    if (!session || !session.trim()) {
      return NextResponse.json({ error: "Session is required!" }, { status: 400 });
    }

    if (!admins || !Array.isArray(admins) || admins.length === 0) {
      return NextResponse.json(
        { error: "At least 1 Admin details with Post is required!" },
        { status: 400 }
      );
    }

    // Check Active Committee Exists for this type
    const committeeStatus = status || "ACTIVE";

    if (committeeStatus === "ACTIVE") {
      const existingActiveCommittee = await prisma.committee.findFirst({
        where: {
          type: type,
          status: "ACTIVE",
        },
      });

      if (existingActiveCommittee) {
        return NextResponse.json(
          {
            error: `An active ${type} committee already exists (Session: ${existingActiveCommittee.session}). Please deactivate or block it before creating a new one.`,
          },
          { status: 400 }
        );
      }
    }

    // Check existing User IDs & Emails
    const userIds = admins.map((a: any) => a.userId);
    const emails = admins.map((a: any) => a.email);

    const existingUsers = await prisma.user.findFirst({
      where: {
        OR: [{ userId: { in: userIds } }, { email: { in: emails } }],
      },
    });

    if (existingUsers) {
      return NextResponse.json(
        { error: "User ID or Email already exists in the system!" },
        { status: 400 }
      );
    }

    const emailListToSend: { email: string; userId: string; name: string; tempPass: string }[] = [];

    // 2. Database Atomic Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Create Committee
      const newCommittee = await tx.committee.create({
        data: {
          type,
          session,
          status: committeeStatus,
        },
      });

      const createdAdmins: any[] = [];

      // Step B: Loop through admins
      for (const adminData of admins) {
        const { userId, name, email, postTitle } = adminData;

        // Step B1: Create Post
        const newPost = await tx.post.create({
          data: {
            postTitle,
            committeeId: newCommittee.id,
          },
        });

        // Step B2: Hash Password
        const tempPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Step B3: Create User linked with the Post
        const newAdmin = await tx.user.create({
          data: {
            userId,
            name,
            email,
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
            postId: newPost.postId,
          },
        });

        emailListToSend.push({
          email,
          userId,
          name,
          tempPass: tempPassword,
        });

        createdAdmins.push(newAdmin);
      }

      return { committee: newCommittee, admins: createdAdmins };
    });

    // 3. Send Emails asynchronously
    Promise.allSettled(
      emailListToSend.map((item) =>
        sendAdminCredentialsEmail(item.email, item.userId, item.name, item.tempPass)
      )
    ).catch((err) => console.error("Email queue error:", err));

    return NextResponse.json(
      {
        message: "Committee, Post, and Admin accounts created successfully!",
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Committee Detailed Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create committee and admins" },
      { status: 500 }
    );
  }
}