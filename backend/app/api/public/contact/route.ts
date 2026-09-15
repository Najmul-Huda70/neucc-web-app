import { prisma } from "@/lib/prisma";
import { ContactMessageSchema } from "@/lib/validation/public";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/public/contact
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!allowed) {
    return Response.json({ error: "Too many submissions, please try again later" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ContactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { website, ...data } = parsed.data;
  if (website) {
    return Response.json({ ok: true }); // honeypot tripped, silently drop
  }

  const message = await prisma.contactMessage.create({ data });
  return Response.json({ ok: true, id: message.id }, { status: 201 });
}
