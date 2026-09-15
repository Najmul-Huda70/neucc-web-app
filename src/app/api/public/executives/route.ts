import { prisma } from "@/lib/prisma";

// GET /api/public/executives?history=true
export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeHistory = url.searchParams.get("history") === "true";

  const currentCommittee = await prisma.committee.findFirst({
    where: { type: "EXECUTIVE", status: "ACTIVE" },
    include: {
      members: {
        select: { id: true, name: true, post: { select: { name: true, rank: true } } },
        orderBy: { post: { rank: "asc" } },
      },
    },
  });

  let pastCommittees: unknown[] = [];
  if (includeHistory) {
    pastCommittees = await prisma.committee.findMany({
      where: { type: "EXECUTIVE", status: "DISSOLVED" },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        members: {
          select: { name: true, post: { select: { name: true, rank: true } } },
          orderBy: { post: { rank: "asc" } },
        },
      },
    });
  }

  return Response.json({
    current: currentCommittee
      ? {
          committeeId: currentCommittee.id,
          startDate: currentCommittee.startDate,
          endDate: currentCommittee.endDate,
          members: currentCommittee.members,
        }
      : null,
    pastCommittees,
  });
}
