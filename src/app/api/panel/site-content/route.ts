import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { ContentPaginationSchema, SiteContentSchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requirePanelAction('content:view');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = ContentPaginationSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid site content filters.', parsed.error.flatten());

  const { page, pageSize, q } = parsed.data;
  const where: Prisma.SiteContentWhereInput = q ? { key: { contains: q, mode: 'insensitive' } } : {};

  try {
    const [items, total] = await Promise.all([
      prisma.siteContent.findMany({ where, orderBy: { key: 'asc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.siteContent.count({ where }),
    ]);

    return collection(items, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

export async function POST(req: Request) {
  const auth = await requirePanelAction('content:manage');
  if (auth.response) return auth.response;

  const body = await readJsonBody(req);
  const parsed = SiteContentSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid site content payload.', parsed.error.flatten());

  try {
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.siteContent.upsert({
        where: { key: parsed.data.key },
        update: { value: parsed.data.value },
        create: { key: parsed.data.key, value: parsed.data.value },
      });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'SITE_CONTENT_UPDATED',
          targetType: 'SiteContent',
          targetId: created.key,
          metadata: { key: created.key },
        },
      });
      return created;
    });

    return ok(item, { status: 201 });
  } catch {
    return unexpectedError();
  }
}
