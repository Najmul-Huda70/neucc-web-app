import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth"; // আপনার verifyRole ফাংশনের Path
import { Role } from "@/generated/prisma/browser";

// অ্যাডমিন জন্য অনুমতি
const ALLOWED_ROLES: Role[] = ["ADMIN"];

// ─────────────────────────────────────────────
// GET: unassigned posts (যেসব পোস্টে কোনো user_posts লিঙ্ক করা নেই)
// ─────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const auth = await verifyRole(ALLOWED_ROLES);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const committeeId = searchParams.get("committeeId");

    if (!committeeId) {
      return NextResponse.json(
        { success: false, error: "committeeId is required" },
        { status: 400 }
      );
    }

    // যেসব পোস্টে কোনো userAssign করা হয়নি (user_posts is empty)
    const unassignedPosts = await prisma.post.findMany({
      where: {
        committeeId: committeeId,
        user_posts: {
          none: {}, // কোনো user assign করা নেই
        },
      },
      select: {
        postId: true,
        postTitle: true,
      },
    });

    return NextResponse.json({ success: true, data: unassignedPosts });
  } catch (error) {
    console.error("GET Posts Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unassigned posts" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST: Create a new post for an active committee
// ─────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const auth = await verifyRole(ALLOWED_ROLES);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const { committeeId, postTitle } = body;

    if (!committeeId || !postTitle) {
      return NextResponse.json(
        { success: false, error: "committeeId and postTitle are required" },
        { status: 400 }
      );
    }

    // কমিটি বিদ্যমান আছে কিনা ভ্যালিডেশন
    const committeeExists = await prisma.committee.findUnique({
      where: { committeeId },
    });

    if (!committeeExists) {
      return NextResponse.json(
        { success: false, error: "Committee not found" },
        { status: 404 }
      );
    }

    const newPost = await prisma.post.create({
      data: {
        committeeId,
        postTitle: postTitle.trim(),
      },
    });

    return NextResponse.json({ success: true, data: newPost });
  } catch (error) {
    console.error("POST Create Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// DELETE: Delete an unassigned post safely
// ─────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const auth = await verifyRole(ALLOWED_ROLES);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "postId is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { postId },
      include: {
        user_posts: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // যদি ইউজার অ্যাসাইন থাকে তবে ডিলিট করতে দেবে না
    if (post.user_posts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Assigned posts cannot be deleted. Unassign users first.",
        },
        { status: 400 }
      );
    }

    await prisma.post.delete({
      where: { postId },
    });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Post Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete post" },
      { status: 500 }
    );
  }
}