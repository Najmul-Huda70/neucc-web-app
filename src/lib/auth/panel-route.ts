import { requireUser } from '@/lib/auth/session';
import { assertCan } from '@/lib/auth/permissions';
import { apiError } from '@/lib/http/api-response';
import type { Action } from '@/lib/auth/permissions';

export async function requirePanelAction(action: Action) {
  const result = await requireUser();
  if (result.error) return { user: null, response: result.error } as const;

  const forbidden = assertCan(result.user, action);
  if (forbidden) {
    return {
      user: null,
      response: apiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'),
    } as const;
  }

  return { user: result.user, response: null } as const;
}
