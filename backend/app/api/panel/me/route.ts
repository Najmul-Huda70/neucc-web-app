import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  return Response.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    post: user.post?.name ?? null,
    committeeStatus: user.committee?.status ?? null,
    capabilities: {
      canManageElection: can(user, "election:manage"),
      canGrantElectionAccess: can(user, "election:grant_access"),
      canDissolveExecutive: can(user, "election:dissolve_executive"),
      canManageEvents: can(user, "event:manage"),
      canPublishGeneralNotice: can(user, "notice:publish:general"),
      canPublishInternalNotice: can(user, "notice:publish:internal"),
      canPublishElectionNotice: can(user, "notice:publish:election"),
      canManageAttendance: can(user, "attendance:create_form"),
      canViewAttendanceOversight: can(user, "attendance:view_oversight"),
      canManageFinance: can(user, "finance:manage"),
      canViewFinanceOversight: can(user, "finance:view_oversight"),
    },
  });
}
