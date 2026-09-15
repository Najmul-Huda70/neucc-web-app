import { prisma } from "@/lib/prisma";

// GET /api/public/sponsors — grouped by tier for the frontend to render in order
export async function GET() {
  const sponsors = await prisma.sponsor.findMany({ orderBy: [{ tier: "asc" }, { name: "asc" }] });

  const grouped = {
    PLATINUM: sponsors.filter((s) => s.tier === "PLATINUM"),
    GOLD: sponsors.filter((s) => s.tier === "GOLD"),
    SILVER: sponsors.filter((s) => s.tier === "SILVER"),
  };

  return Response.json({ sponsors: grouped });
}
