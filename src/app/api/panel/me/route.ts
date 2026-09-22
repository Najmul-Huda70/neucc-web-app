import { requireUser } from "@/lib/auth/session";
import { getCapabilities } from "@/lib/auth/capabilities";

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
    capabilities: getCapabilities(user),
  });
}
