// lib/services/committees.ts
import { prisma } from "@/lib/prisma";

export const publicCommitteeSelect = {
  committeeId: true,
  type: true,
  year: true,
  status: true,
  posts: {
    orderBy: { createdAt: "asc" as const },
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
};

export async function getPublicCommittees() {
  try {
    const committees = await prisma.committee.findMany({
      orderBy: { createdAt: "desc" },
      select: publicCommitteeSelect,
    });

    return committees;
  } catch (error) {
    console.error("Error fetching public committees:", error);
    return [];
  }
}