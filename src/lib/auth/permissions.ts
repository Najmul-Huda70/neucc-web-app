import type { CurrentUser } from "@/lib/auth/session";

/**
 * Every permission-guarded action in the system, in one place. Route
 * handlers call `can(user, action)` — never re-implement a role/post check
 * inline. This mirrors the Role-wise Permission Matrix (SRS §5.4) plus the
 * post-specific rules scattered through §6.1–§6.6.
 */
export type Action =
  | "dashboard:view"
  | "constitution:view"
  // Election Module (§5.4, §6.1)
  | "election:manage" // create election, verify candidates, allot symbols
  | "election:grant_access" // President grants Chief Election Commissioner access
  | "election:dissolve_executive" // Chief Election Commissioner, once granted
  // Events (§6.2)
  | "event:manage" // create/edit/delete
  | "event:view"
  // Public content management (§3.3–3.9, Sprint 2)
  | "content:manage"
  | "content:view"
  // Notices (§6.3, §6.3.4)
  | "notice:publish:general"
  | "notice:publish:internal"
  | "notice:publish:election"
  | "notice:ai_generate" // Agentic AI Content Generator — Notice & Publication Team only
  | "notice:view:general"
  | "notice:view:internal"
  | "notice:view:election"
  // Resolutions & documents (§6.3)
  | "resolution:manage"
  | "document:manage"
  // Attendance (§6.4)
  | "attendance:create_form"
  | "attendance:view_all" // full access to every submission
  | "attendance:view_oversight" // President/General Secretary: view-only
  // Finance (§6.6)
  | "finance:manage" // create/edit income & expense entries
  | "finance:view_oversight"; // President: view-and-download only

const NOTICE_PUBLICATION_TEAM = new Set([
  "Information Secretary",
  "Assistant Information Secretary",
  "Editor Secretary",
  "Assistant Editor Secretary",
  "Publicity & Publication Secretary",
  "Assistant Publicity & Publication Secretary",
]);

const EVENT_MANAGERS = new Set(["Event Management Secretary", "Assistant Event Management Secretary"]);
const ATTENDANCE_MANAGERS = new Set(["Information Secretary", "Assistant Information Secretary"]);
const ATTENDANCE_OVERSIGHT = new Set(["President", "General Secretary"]);

export function can(user: CurrentUser, action: Action): boolean {
  const post = user.post?.name;
  const committeeActive = user.committee?.status === "ACTIVE";
  const isElectionCommittee = user.role === "ELECTION_COMMITTEE";
  const isExecutiveCommittee = user.role === "EXECUTIVE_COMMITTEE";

  switch (action) {
    case "dashboard:view":
    case "constitution:view":
      return true; // every logged-in user, per §5.4

    case "election:manage":
      return isElectionCommittee && committeeActive;

    case "election:grant_access":
      return isExecutiveCommittee && post === "President";

    case "election:dissolve_executive":
      return isElectionCommittee && post === "Chief Election Commissioner" && user.electionAccessGranted;

    case "event:manage":
      return isExecutiveCommittee && !!post && EVENT_MANAGERS.has(post);

    case "event:view":
      return true; // any logged-in role; public visitors use the public API instead

    case "content:manage":
    case "content:view":
      return isExecutiveCommittee && !!post && (post === "President" || post === "Information Secretary" || post === "Assistant Information Secretary" || post === "General Secretary" || post === "Editor Secretary" || post === "Assistant Editor Secretary");

    case "notice:publish:general":
    case "notice:publish:internal":
      return isExecutiveCommittee && !!post && NOTICE_PUBLICATION_TEAM.has(post);

    case "notice:publish:election":
      return isElectionCommittee; // any active Election Committee member, per §6.3.4

    case "notice:ai_generate":
      return isExecutiveCommittee && !!post && NOTICE_PUBLICATION_TEAM.has(post);

    case "notice:view:general":
      return true;

    case "notice:view:internal":
      return isExecutiveCommittee; // hidden from Election Committee, per §6.3.4

    case "notice:view:election":
      return isElectionCommittee; // hidden from Executive Committee, per §6.3.4

    case "resolution:manage":
    case "document:manage":
      return isExecutiveCommittee && !!post && ATTENDANCE_MANAGERS.has(post); // same posts, §6.3

    case "attendance:create_form":
      return isExecutiveCommittee && !!post && ATTENDANCE_MANAGERS.has(post);

    case "attendance:view_all":
      return isExecutiveCommittee && !!post && ATTENDANCE_MANAGERS.has(post);

    case "attendance:view_oversight":
      return isExecutiveCommittee && !!post && ATTENDANCE_OVERSIGHT.has(post);

    case "finance:manage":
      return isExecutiveCommittee && post === "Treasurer";

    case "finance:view_oversight":
      return isExecutiveCommittee && post === "President";

    default:
      return false;
  }
}

/** Throws a 403 Response if the check fails — convenient in route handlers. */
export function assertCan(user: CurrentUser, action: Action): Response | null {
  if (!can(user, action)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
