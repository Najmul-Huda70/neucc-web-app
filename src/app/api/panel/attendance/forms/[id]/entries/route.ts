import { prisma } from "@/lib/prisma";
import { apiError, collection, unexpectedError } from "@/lib/http/api-response";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (!can(auth.user, "attendance:view_all") && !can(auth.user, "attendance:view_oversight")) {
    return apiError(403, "FORBIDDEN", "You do not have permission to view attendance entries.");
  }
  const { id } = await params;
  try {
    const form = await prisma.attendanceForm.findUnique({ where: { id }, select: { id: true } });
    if (!form) return apiError(404, "NOT_FOUND", "Attendance form not found.");
    const entries = await prisma.attendanceEntry.findMany({ where: { formId: id }, orderBy: { submittedAt: "desc" } });
    return collection(entries, { page: 1, pageSize: entries.length || 1, total: entries.length });
  } catch {
    return unexpectedError();
  }
}