import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/http/request";
import { apiError, collection, ok, unexpectedError } from "@/lib/http/api-response";
import { requirePanelAction } from "@/lib/auth/panel-route";
import { AttendanceFormCreateSchema, OperationsPaginationSchema } from "@/lib/validation/public";

export async function GET(req: Request) {
  const auth = await requirePanelAction("attendance:view_all");
  if (auth.response) return auth.response;
  const parsed = OperationsPaginationSchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid attendance filters.", parsed.error.flatten());
  const { page, pageSize, q } = parsed.data;
  const where: Prisma.AttendanceFormWhereInput = q ? { title: { contains: q, mode: "insensitive" } } : {};
  try {
    const [forms, total] = await Promise.all([
      prisma.attendanceForm.findMany({ where, include: { _count: { select: { entries: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.attendanceForm.count({ where }),
    ]);
    return collection(forms, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

export async function POST(req: Request) {
  const auth = await requirePanelAction("attendance:create_form");
  if (auth.response) return auth.response;
  const parsed = AttendanceFormCreateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid attendance form.", parsed.error.flatten());
  try {
    const form = await prisma.$transaction(async (tx) => {
      const created = await tx.attendanceForm.create({ data: { ...parsed.data, createdById: auth.user.id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: "ATTENDANCE_FORM_CREATED", targetType: "AttendanceForm", targetId: created.id } });
      return created;
    });
    return ok(form, { status: 201 });
  } catch {
    return unexpectedError();
  }
}