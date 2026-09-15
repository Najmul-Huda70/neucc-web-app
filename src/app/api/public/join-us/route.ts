import { prisma } from "@/lib/prisma";
import { MembershipApplicationSchema } from "@/lib/validation/public";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/public/join-us
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`join-us:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!allowed) {
    return Response.json({ error: "Too many submissions, please try again later" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = MembershipApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { website, ...data } = parsed.data;
  if (website) {
    // Honeypot tripped — pretend success so the bot doesn't learn anything,
    // but don't actually write a row.
    return Response.json({ ok: true });
  }

  const application = await prisma.membershipApplication.create({
    data: {
      name: data.name,
      studentId: data.studentId,
      batch: data.batch,
      email: data.email,
      interest: data.interest,
    },
  });

  return Response.json({ ok: true, id: application.id }, { status: 201 });
}
