import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { GalleryItemCreateSchema, ContentPaginationSchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requirePanelAction('content:view');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = ContentPaginationSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid gallery filters.', parsed.error.flatten());

  const { page, pageSize, q } = parsed.data;
  const where: Prisma.GalleryItemWhereInput = q ? {
    OR: [
      { url: { contains: q, mode: 'insensitive' } },
      { eventName: { contains: q, mode: 'insensitive' } },
    ],
  } : {};

  try {
    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.galleryItem.count({ where }),
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
  const parsed = GalleryItemCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid gallery item data.', parsed.error.flatten());

  try {
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.galleryItem.create({ data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'GALLERY_ITEM_CREATED',
          targetType: 'GalleryItem',
          targetId: created.id,
        },
      });
      return created;
    });

    return ok(item, { status: 201 });
  } catch {
    return unexpectedError();
  }
}
