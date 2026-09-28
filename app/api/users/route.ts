import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

export async function GET() {
  const auth = await verifyRole(["ADMIN"]);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        status: true,
        user_posts: {
          select: {
            postId: true,
            committeeId: true,
            post: {
              select: {
                postTitle: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filtering active user_posts & active posts programmatically to prevent Prisma relational query errors
    const formattedUsers = users.map((u) => ({
      ...u,
      user_posts: u.user_posts
        .filter((up) => up.post && up.post.status === "ACTIVE")
        .map((up) => ({
          postId: up.postId,
          committeeId: up.committeeId,
          post: {
            postTitle: up.post?.postTitle || "",
          },
        })),
    }));

    return NextResponse.json({ success: true, data: formattedUsers });
  } catch (error) {
    // Terminal / Console-এ আসল এরর দেখার জন্য
    console.error("Failed to fetch users (Prisma Error):", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users." },
      { status: 500 }
    );
  }
}