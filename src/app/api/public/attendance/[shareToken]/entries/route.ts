import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/http/request";
import { apiError, ok, unexpectedError } from "@/lib/http/api-response";
import { AttendanceEntrySchema } from "@/lib/validation/public";

type Context = { params: Promise<{ shareToken: string }> };

export async function POST(req: Request, { params }: Context) {
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