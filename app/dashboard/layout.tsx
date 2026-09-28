import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import DashboardClientLayout from "@/components/dashboard/DashboardClientLayout";
import { AuthUser } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // proxy.ts নিরাপত্তা নিশ্চিত করেছে, তবে সাইড-ইফেক্ট এড়াতে একটি নিরাপদ Fallback
  let payload: Record<string, unknown> = {};

  if (token) {
    try {
      payload = decodeJwt(token);
    } catch {
      payload = {};
    }
  }

  const user: AuthUser = {
    userId: (payload.userId as string) || "",
    name: (payload.name as string) || "User",
    email: (payload.email as string) || "",
    role: (payload.role as string) || "MEMBER",
    status: (payload.status as string) || "ACTIVE",
  };

  return (
    <DashboardClientLayout user={user}>
      {children}
    </DashboardClientLayout>
  );
}