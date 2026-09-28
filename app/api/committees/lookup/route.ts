import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Type } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as Type;
  const yearStr = searchParams.get("year");

  if (!type || !yearStr) {
    return NextResponse.json(
      { success: false, message: "Type and year are required" },
      { status: 400 }
    );
  }

  try {
    const committee = await prisma.committee.findUnique({
      where: {
        type_year: {
          type,
          year: parseInt(yearStr, 10),
        },
      },
      select: {
        committeeId: true,
        posts: {
          select: {
            postId: true,
            postTitle: true,
          },
        },
      },
    });

    if (!committee) {
      return NextResponse.json(
        { success: false, message: "Committee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      committeeId: committee.committeeId,
      posts: committee.posts,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lookup failed" },
      { status: 500 }
    );
  }
}