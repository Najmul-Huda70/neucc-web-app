import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { SiteContentSchema } from '@/lib/validation/public';

type Context = { params: Promise<{ key: string }> };

export async function GET(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('content:view');
  if (auth.response) return auth.response;
  const { key } = await params;

  try {
    const item = await prisma.siteContent.findUnique({ where: { key } });
    if (!item) return apiError(404, 'NOT_FOUND', 'Site content key not found.');
    return ok(item);
  } catch {
    return unexpectedError();
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const auth = await requirePanelAction('content:manage');
  if (auth.response) return auth.response;
  const { key } = await params;
  const body = await readJsonBody(req);
  const parsed = SiteContentSchema.safeParse(body && typeof body === 'object' ? { key, ...body } : { key, value: null });
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid site content payload.', parsed.error.flatten());

  try {
    const item = await prisma.$transaction(async (tx) => {
      const updated = await tx.siteContent.upsert({
        where: { key },
        update: { value: parsed.data.value },
        create: { key, value: parsed.data.value },
      });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'SITE_CONTENT_UPDATED',
          targetType: 'SiteContent',
          targetId: key,
          metadata: { key },
        },
      });
      return updated;
    });

    return ok(item);
  } catch {
    return unexpectedError();
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const auth = await requirePanelAction('content:manage');
  if (auth.response) return auth.response;
  const { key } = await params;

  try {
    const item = await prisma.siteContent.findUnique({ where: { key }, select: { key: true } });
    if (!item) return apiError(404, 'NOT_FOUND', 'Site content key not found.');
    await prisma.siteContent.delete({ where: { key } });
    await prisma.auditLog.create({
      data: {
        actorId: auth.user.id,
        action: 'SITE_CONTENT_DELETED',
        targetType: 'SiteContent',
        targetId: key,
        metadata: { key },
      },
    });
    return ok({ key });
  } catch {
    return unexpectedError();
  }
}
