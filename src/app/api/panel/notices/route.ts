import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { noticePublishAction, noticeViewAction } from '@/lib/auth/notice-actions';
import { NoticeCreateSchema, PanelNoticesQuerySchema } from '@/lib/validation/public';
import { can } from '@/lib/auth/permissions';

export async function GET(req: Request) {
  const auth = await requirePanelAction('notice:view:general');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = PanelNoticesQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid notice filters.', parsed.error.flatten());

  const { page, pageSize, scope } = parsed.data;
  const scopes = scope
    ? [scope]
    : [
        ...(can(auth.user, 'notice:view:general') ? ['GENERAL' as const] : []),
        ...(can(auth.user, 'notice:view:internal') ? ['INTERNAL' as const] : []),
        ...(can(auth.user, 'notice:view:election') ? ['ELECTION' as const] : []),
      ];
  if (scope && !can(auth.user, noticeViewAction(scope))) {
    return apiError(403, 'FORBIDDEN', 'You cannot view notices in this scope.');
  }

  const where: Prisma.NoticeWhereInput = { scope: { in: scopes } };
  try {
    const [notices, total] = await Promise.all([
      prisma.notice.findMany({ where, orderBy: [{ isPinned: 'desc' }, { date: 'desc' }], skip: (page - 1) * pageSize, take: pageSize }),
      prisma.notice.count({ where }),
    ]);
    return collection(notices, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

export async function POST(req: Request) {
  const body = await readJsonBody(req);
  const parsed = NoticeCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid notice data.', parsed.error.flatten());

  const auth = await requirePanelAction(noticePublishAction(parsed.data.scope));
  if (auth.response) return auth.response;

  try {
    const notice = await prisma.$transaction(async (tx) => {
      const created = await tx.notice.create({ data: { ...parsed.data, publishedById: auth.user.id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: 'NOTICE_CREATED', targetType: 'Notice', targetId: created.id, metadata: { scope: created.scope } } });
      return created;
    });
    return ok(notice, { status: 201 });
  } catch {
    return unexpectedError();
  }
}
