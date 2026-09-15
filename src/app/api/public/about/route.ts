import { prisma } from "@/lib/prisma";

const KEYS = ["about.mission", "about.vision", "about.history", "about.facultyAdvisors"] as const;

// GET /api/public/about
export async function GET() {
  const blocks = await prisma.siteContent.findMany({ where: { key: { in: [...KEYS] } } });
  const content = Object.fromEntries(blocks.map((b) => [b.key, b.value]));

  return Response.json({
    mission: content["about.mission"] ?? null,
    vision: content["about.vision"] ?? null,
    history: content["about.history"] ?? null,
    facultyAdvisors: content["about.facultyAdvisors"] ?? [],
    // Constitution PDF is a static asset — served directly, not via this API.
    constitutionUrl: "/documents/neucc-constitution.pdf",
  });
}
