import { prisma } from "@/lib/prisma";

export async function getSarokCategories() {
  try {
    const categories = await prisma.sarok.findMany({
      include: {
        _count: { select: { notices: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching sarok categories:", error);
    return { success: false, error: "Failed to fetch sarok categories" };
  }
}