import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Database Query with Schema Relations
    const committees = await prisma.committee.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        type: true,
        year: true,
        status: true,
        posts: {
          orderBy: { createdAt: "asc" },
          select: {
            postTitle: true,
            status: true,
            user_posts: {
              select: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: committees,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get Committees API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch committees" },
      { status: 500 }
    );
  }
}