import { prisma } from "@/lib/prisma";

// GET /api/public/home (SRS §3.1)
export async function GET() {
  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setFullYear(now.getFullYear() - 1);

  const [
    approvedMembers,
    eventsPastYear,
    workshopsPastYear,
    upcomingEvents,
    topAchievements,
    contentBlocks,
  ] = await Promise.all([
    prisma.membershipApplication.count({ where: { status: "APPROVED" } }),
    prisma.event.count({ where: { date: { gte: yearAgo, lte: now } } }),
    prisma.event.count({ where: { category: "WORKSHOP", date: { gte: yearAgo, lte: now } } }),
    prisma.event.findMany({
      where: { status: "UPCOMING" },
      orderBy: { date: "asc" },
      take: 3,
    }),
    prisma.achievement.findMany({ orderBy: { date: "desc" }, take: 4 }),
    prisma.siteContent.findMany({
      where: { key: { in: ["home.chairpersonMessage", "home.moderatorMessage", "home.aboutSnapshot"] } },
    }),
  ]);

  const content = Object.fromEntries(contentBlocks.map((c) => [c.key, c.value]));

  return Response.json({
    stats: {
      totalMembers: approvedMembers,
      eventsPerYear: eventsPastYear,
      workshopsConducted: workshopsPastYear,
    },
    upcomingEvents,
    highlights: topAchievements,
    chairpersonMessage: content["home.chairpersonMessage"] ?? null,
    moderatorMessage: content["home.moderatorMessage"] ?? null,
    aboutSnapshot: content["home.aboutSnapshot"] ?? null,
  });
}
