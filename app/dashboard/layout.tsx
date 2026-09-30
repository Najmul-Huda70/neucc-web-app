import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import DashboardClientLayout from "@/components/dashboard/DashboardClientLayout";
import { getUserProfile } from "@/lib/services/users";
import { AuthUser } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let userId = "";

  if (token) {
    try {
      const payload = decodeJwt(token);
      userId = (payload.userId as string) || "";
    } catch {
      userId = "";
    }
  }

  // সরাসরি সার্ভিস ফাংশন কল (ডিবি Query)
  const dbUser = await getUserProfile(userId);

  const user: AuthUser = {
    userId: dbUser?.userId || userId,
    name: dbUser?.name || "User",
    email: dbUser?.email || "",
    image: dbUser?.image || null,
    role: dbUser?.role || "MEMBER",
    status: dbUser?.status || "",
  };

  return (
    <DashboardClientLayout user={user}>
      {children}
    </DashboardClientLayout>
  );
}