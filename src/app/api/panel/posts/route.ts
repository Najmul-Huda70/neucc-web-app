import { prisma } from '@/lib/prisma';
import { ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';

// GET /api/panel/posts — the full list of the 20 constitutional posts.
//
// Added for Step 5: the reopen-to-all-members workflow needs to show every
// post, including ones with zero candidates so far — which never show up
// in `GET /api/panel/candidates` at all, since that only returns rows that
// exist. There was no endpoint to list `Post` on its own before this.
//
// Read-only and small (20 rows, rarely changes), so no pagination.
export async function GET() {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;

  try {
    const posts = await prisma.post.findMany({
      orderBy: { rank: 'asc' },
      select: { id: true, name: true, eligibleYear: true, isAssistant: true, rank: true },
    });
    return ok(posts);
  } catch {
    return unexpectedError();
  }
}
