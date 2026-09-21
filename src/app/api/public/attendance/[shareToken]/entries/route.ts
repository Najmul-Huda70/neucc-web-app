import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/http/request";
import { apiError, ok, unexpectedError } from "@/lib/http/api-response";
import { AttendanceEntrySchema } from "@/lib/validation/public";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Context = { params: Promise<{ shareToken: string }> };

// A public, unauthenticated write endpoint (by design — this is how Club
// Members/Advisory Board, who have no login, mark attendance). Same class
// of endpoint as join-us/contact, which already had rate limiting; this one
// didn't, found during a security review — fixed to match.
export async function POST(req: Request, { params }: Context) {
  const ip = getClientIp(req);
  const rate = rateLimit(`attendance-entry:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rate.allowed) {
    return apiError(429, "RATE_LIMITED", "Too many submissions, please try again later.");
  }

  const parsed = AttendanceEntrySchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid attendance entry.", parsed.error.flatten());
  const { shareToken } = await params;
  try {
    const form = await prisma.attendanceForm.findUnique({ where: { shareToken }, select: { id: true } });
    if (!form) return apiError(404, "NOT_FOUND", "Attendance form not found.");
    const entry = await prisma.attendanceEntry.create({ data: { ...parsed.data, formId: form.id } });
    return ok(entry, { status: 201 });
  } catch {
    return unexpectedError();
  }
}