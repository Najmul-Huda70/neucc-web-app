import type { NoticeScope } from '@prisma/client';
import type { Action } from '@/lib/auth/permissions';

export function noticePublishAction(scope: NoticeScope): Action {
  return scope === 'GENERAL'
    ? 'notice:publish:general'
    : scope === 'INTERNAL'
      ? 'notice:publish:internal'
      : 'notice:publish:election';
}

export function noticeViewAction(scope: NoticeScope): Action {
  return scope === 'GENERAL'
    ? 'notice:view:general'
    : scope === 'INTERNAL'
      ? 'notice:view:internal'
      : 'notice:view:election';
}
