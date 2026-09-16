import { prisma } from "@/lib/prisma";
import { ContactMessageSchema } from "@/lib/validation/public";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody, withRateLimitHeaders } from "@/lib/http/request";

// POST /api/public/contact
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
  const { allowed } = rate;
  if (!allowed) {
    return withRateLimitHeaders(Response.json({ error: "Too many submissions, please try again later" }, { status: 429 }), rate.remaining, rate.resetAt);
  }

  const body = await readJsonBody(req);
  const parsed = ContactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return withRateLimitHeaders(Response.json({ error: parsed.error.flatten() }, { status: 400 }), rate.remaining, rate.resetAt);
  }

  const { website, ...data } = parsed.data;
  if (website) {
    return withRateLimitHeaders(Response.json({ ok: true }), rate.remaining, rate.resetAt); // honeypot tripped, silently drop
  }

  const message = await prisma.contactMessage.create({ data });
  return withRateLimitHeaders(Response.json({ ok: true, id: message.id }, { status: 201 }), rate.remaining, rate.resetAt);
}
