import { prisma } from "@/lib/prisma";
import type { ContestType } from "@prisma/client";

// GET /api/public/contests?type=CTF
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") as ContestType | null;

  const contests = await prisma.contest.findMany({
    where: type ? { type } : undefined,
    orderBy: { date: "desc" },
  });

  return Response.json({ contests });
}
