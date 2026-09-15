import { prisma } from "@/lib/prisma";

// GET /api/public/achievements
export async function GET() {
  const achievements = await prisma.achievement.findMany({ orderBy: { date: "desc" } });
  return Response.json({ achievements });
}
