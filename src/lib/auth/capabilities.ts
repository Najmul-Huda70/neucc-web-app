import type { CurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";

/**
 * Single source of truth for the capability map handed to the frontend.
 * Both `/api/panel/me` (client-side fetches) and `src/app/dashboard/layout.tsx`
 * (server-rendered nav) call this so the two never drift out of sync.
 */
export function getCapabilities(user: CurrentUser) {
  return {
    canManageElection: can(user, "election:manage"),
    canGrantElectionAccess: can(user, "election:grant_access"),
    canDissolveExecutive: can(user, "election:dissolve_executive"),
    canCreateElectionCommittee: can(user, "committee:create_election"),
    canManageUsers: can(user, "user:manage"),
    canManageEvents: can(user, "event:manage"),
    canManageContent: can(user, "content:manage"),
    canViewContent: can(user, "content:view"),
    canPublishGeneralNotice: can(user, "notice:publish:general"),
    canPublishInternalNotice: can(user, "notice:publish:internal"),
    canPublishElectionNotice: can(user, "notice:publish:election"),
    canManageAttendance: can(user, "attendance:create_form"),
    canViewAttendanceOversight: can(user, "attendance:view_oversight"),
    canManageResolution: can(user, "resolution:manage"),
    canManageDocument: can(user, "document:manage"),
    canManageMembership: can(user, "membership:manage"),
    canViewContactMessages: can(user, "contact:view"),
    canManageFinance: can(user, "finance:manage"),
    canViewFinanceOversight: can(user, "finance:view_oversight"),
  };
}

export type Capabilities = ReturnType<typeof getCapabilities>;
