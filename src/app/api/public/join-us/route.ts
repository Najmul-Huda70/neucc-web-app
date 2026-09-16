import { prisma } from "@/lib/prisma";
import { MembershipApplicationSchema } from "@/lib/validation/public";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody, withRateLimitHeaders } from "@/lib/http/request";

// POST /api/public/join-us
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = rateLimit(`join-us:${ip}`, { limit: 3, windowMs: 60_000 });
  const { allowed } = rate;
  if (!allowed) {
    return withRateLimitHeaders(Response.json({ error: "Too many submissions, please try again later" }, { status: 429 }), rate.remaining, rate.resetAt);
  }

  const body = await readJsonBody(req);
  const parsed = MembershipApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return withRateLimitHeaders(Response.json({ error: parsed.error.flatten() }, { status: 400 }), rate.remaining, rate.resetAt);
  }

  const { website, ...data } = parsed.data;
  if (website) {
    // Honeypot tripped — pretend success so the bot doesn't learn anything,
    // but don't actually write a row.
    return withRateLimitHeaders(Response.json({ ok: true }), rate.remaining, rate.resetAt);
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

  return withRateLimitHeaders(Response.json({ ok: true, id: application.id }, { status: 201 }), rate.remaining, rate.resetAt);
}
